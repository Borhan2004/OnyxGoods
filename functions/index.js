const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

admin.initializeApp();

/**
 * Triggered on creation of a document in 'orders' collection.
 * Syncs the order details to the specified Google Sheet.
 */
exports.syncOrderToGoogleSheets = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    
    // 1. Get configurations from Firebase Environment Config or Node process env
    const spreadsheetId = functions.config().google?.sheet_id || process.env.GOOGLE_SHEET_ID;
    let serviceAccount = null;
    
    try {
      // Look for credential file in local directory
      serviceAccount = require('./service-account.json');
    } catch (e) {
      // Fallback: Check if JSON credentials string was loaded into environment config
      const configJson = functions.config().google?.service_account_json || process.env.GOOGLE_CREDENTIALS_JSON;
      if (configJson) {
        try {
          serviceAccount = JSON.parse(configJson);
        } catch (jsonErr) {
          console.error("Failed to parse Google credentials JSON from configuration.", jsonErr);
        }
      }
    }
    
    // If not configured, print logs with guidance instead of throwing errors
    if (!spreadsheetId || !serviceAccount) {
      console.warn(
        "Google Sheets Integration is inactive. Please configure spreadsheetId and serviceAccount. " +
        "Check README.md for setup instructions."
      );
      return null;
    }
    
    try {
      // 2. Setup JWT Auth
      const auth = new google.auth.JWT(
        serviceAccount.client_email,
        null,
        serviceAccount.private_key.replace(/\\n/g, '\n'), // format newline chars in private key
        ['https://www.googleapis.com/auth/spreadsheets']
      );
      
      const sheets = google.sheets({ version: 'v4', auth });
      
      // 3. Compute cost details
      let price = 0;
      if (order.product === "Daily Raw Cow Milk") price = 80;
      else if (order.product === "Full Cream Village Milk") price = 95;
      else if (order.product === "Premium Village Cow Ghee") price = 1200;
      const totalCost = price * order.quantity;
      
      // 4. Map columns: Date | Name | Phone | WhatsApp | Area | Landmark | Address | Product | Qty | Total Cost | Plan | Payment Method | Status | Created At (BD Time)
      const createdAtLocal = order.createdAt 
        ? new Date(order.createdAt).toLocaleString("en-US", { timeZone: "Asia/Dhaka" }) 
        : new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
        
      const values = [
        [
          order.deliveryDate || "",
          order.name || "",
          order.phone || "",
          order.whatsapp || "",
          order.area || "",
          order.landmark || "",
          order.address || "",
          order.product || "",
          order.quantity || 0,
          totalCost,
          order.subscriptionType || "",
          order.paymentMethod || "",
          order.status || "Pending",
          createdAtLocal
        ]
      ];
      
      // 5. Append row to Sheet1
      await sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A:N',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: values
        }
      });
      
      console.log(`Order ${snap.id} written to Google Sheet successfully.`);
      return { success: true };
      
    } catch (error) {
      console.error("Google Sheets write execution failed:", error);
      return { success: false, error: error.message };
    }
  });
