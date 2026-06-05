# DudhWala Milk Delivery Platform

DudhWala is an operations-driven, farm-fresh milk delivery web application. Sourced direct from rural farmer families, the system is designed to handle ordering logistics, cold chain operations, and order dispatching.

This project is built as a lightweight, performant Firebase application.

---

## Repository Structure

```text
gram-dudh/
├── public/
│   ├── index.html       # Customer Landing Page & Order Form
│   ├── admin.html       # Admin Portal (Login Protected)
│   ├── styles.css       # Unified Modern Styles & Dashboard Layout
│   ├── app.js           # Client Order Controller & WhatsApp Redirect
│   └── admin.js         # Admin Panel Operations Controller
├── functions/
│   ├── index.js         # Cloud Function (Google Sheets Sync Trigger)
│   └── package.json     # Node Functions Dependencies
├── firebase.json        # Firebase Hosting, Functions, and Firestore routing
├── firestore.rules      # Public checkout / Admin-only management security rules
├── firestore.indexes.json
└── README.md            # Configuration and deployment manual
```

---

## 🚀 Instant Local Testing (Mock Mode)

To make development and previewing immediate, the application comes with a built-in **Mock Database Fallback**. If you haven't configured your Firebase credentials yet:
1. Open `public/index.html` in any browser or launch a simple local server:
   ```bash
   npx http-server public
   ```
2. Place a few orders on the website.
3. Access `/admin` (or `admin.html`) to manage them.
4. Log in with the testing credentials:
   - **Email:** `onyxsupport36@gmail.com`
   - **Password:** `Eusuf#`
5. You can view stats, update statuses (Pending, Dispatched, Delivered, Cancelled), filter by delivery dates, and export spreadsheet-compatible CSVs.

*All data in mock mode is saved and managed within your browser's LocalStorage.*

---

## 🛠️ Production Firebase Setup

To move from Mock Mode to a production database:

### 1. Configure Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2. Go to **Authentication** -> **Sign-in method** and enable **Email/Password**.
3. Create an admin user under the **Users** tab (e.g. `your-admin@dudhwala.com` and a secure password).
4. Go to **Firestore Database** and click **Create Database** (Select Start in test mode, since rules will be overwritten from code).

### 2. Add Project Keys to Code
Copy your Firebase Web App configuration credentials block from the console settings and paste it inside:
1. `public/app.js` (lines 3-10)
2. `public/admin.js` (lines 2-9)

The code will automatically detect the key updates and switch from Mock Mode to Firestore.

### 3. Deploy Frontend & Rules
Install Firebase CLI tools, log in, select your project, and deploy:
```bash
# Install Firebase Tools
npm install -g firebase-tools

# Login to Google Account
firebase login

# Initialize/Link with your Firebase Project ID
firebase use --add [YOUR_PROJECT_ID]

# Deploy Firestore rules
firebase deploy --only firestore

# Deploy Static Frontend to Hosting
firebase deploy --only hosting
```

---

## 📊 Google Sheets Sync Cloud Function Setup

When a customer checks out, a Cloud Function automatically appends the order to a Google Sheet.

### Step 1: Create Google Cloud Service Account
1. Open the [GCP Console](https://console.cloud.google.com/) for your Firebase project.
2. Go to **IAM & Admin** -> **Service Accounts**.
3. Click **Create Service Account**, name it `google-sheets-sync`, and give it no roles (not needed).
4. Click on the created service account, go to the **Keys** tab, click **Add Key** -> **Create New Key**, and select **JSON**.
5. Save the downloaded JSON file as `service-account.json` inside the `functions/` directory of this project.

### Step 2: Share Google Sheet with Service Account
1. Create a new Google Sheet (or use an existing one).
2. Create/rename the first tab sheet to `Sheet1`.
3. Copy the spreadsheet ID from the URL (e.g., `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`).
4. Click **Share** on the Google Sheet, and invite the service account email (found in the `client_email` field of your JSON file) as an **Editor**.

### Step 3: Configure environment & Deploy
Provide the spreadsheet ID to your Cloud Functions configuration:
```bash
# Set sheet ID configuration variable
firebase functions:config:set google.sheet_id="YOUR_SPREADSHEET_ID"

# Deploy Cloud Functions
firebase deploy --only functions
```

---

## 📲 Operations Workflow

1. **Ordering:** Customer fills out order details (Name, Phone, WhatsApp, Address, Area, Landmark, Product, Quantity, Delivery Date, Subscription Plan, Payment Method).
2. **Alerts:** On submission, the site pushes the order to Firestore/LocalStorage and triggers a pre-filled WhatsApp click-to-chat window, forwarding the invoice directly to the company line.
3. **Admin Verification:** The admin logs in at `/admin`, checks tomorrow's delivery count, checks bKash/Nagad transactions, and exports tomorrow's orders as a CSV.
4. **Logistics:** The delivery team imports the CSV into Google Sheets (or accesses the auto-synced spreadsheet) to structure the delivery route.
5. **Fulfillment:** As delivery personnel drop off milk next morning, the admin toggles order statuses to `Delivered`.
