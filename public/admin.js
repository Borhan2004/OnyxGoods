// Firebase configuration placeholders - must match app.js
const firebaseConfig = {
  apiKey: "AIzaSyAvvNhK4Kqy6J16ROHLJuszzvGtuLVxTbk",
  authDomain: "fir-task-23a92.firebaseapp.com",
  projectId: "fir-task-23a92",
  storageBucket: "fir-task-23a92.firebasestorage.app",
  messagingSenderId: "419478630401",
  appId: "1:419478630401:web:4bf76c094377a4c1ae5000"
};

// Global State Variables
let db = null;
let isMockMode = false;
let activeFilter = 'today'; // default filter

// Data Arrays
let orders = [];
let customers = [];
let subscriptions = [];

// Initialize Database & Auth Listeners
function initializeAdminPortal() {
  const isDefaultConfig = firebaseConfig.projectId.includes("YOUR_PROJECT_ID_HERE") || !firebaseConfig.apiKey;

  if (isDefaultConfig) {
    console.warn("Admin panel is running in MOCK MODE (local storage).");
    isMockMode = true;
    setupMockSession();
  } else {
    try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      
      // Setup Firebase Auth listener
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          showDashboard(user.email);
        } else {
          showLoginScreen();
        }
      });
    } catch (error) {
      console.error("Firebase auth initialization failed. Falling back to Mock Mode.", error);
      isMockMode = true;
      setupMockSession();
    }
  }
}

// Mock auth session management for LocalStorage mode
function setupMockSession() {
  const isLogged = sessionStorage.getItem("gram_dudh_admin_logged") === "true";
  if (isLogged) {
    showDashboard("admin@khamarghor.com");
  } else {
    showLoginScreen();
  }
}

// Show Dashboard container, hide login
function showDashboard(email) {
  document.getElementById("authOverlay").style.display = "none";
  document.getElementById("dashboardWrapper").style.display = "block";
  document.getElementById("adminUserEmail").innerText = email;
  loadPortalData();
}

// Show Login overlay, hide dashboard
function showLoginScreen() {
  document.getElementById("authOverlay").style.display = "flex";
  document.getElementById("dashboardWrapper").style.display = "none";
}

// Handle login submissions
async function handleAdminLogin(event) {
  event.preventDefault();
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value.trim();
  const submitBtn = document.getElementById("btn-login-submit");

  submitBtn.disabled = true;
  submitBtn.innerText = "Authenticating...";

  try {
    if (isMockMode) {
      // Hardcoded mock credentials
      if (email === "admin@khamarghor.com" && password === "password123") {
        sessionStorage.setItem("gram_dudh_admin_logged", "true");
        showDashboard(email);
        showToast("Logged in successfully (Mock Mode)");
      } else {
        throw new Error("Invalid mock credentials. Use email: admin@khamarghor.com, password: password123");
      }
    } else {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      showToast("Access granted!");
    }
  } catch (error) {
    console.error("Login error:", error);
    showToast(error.message || "Failed to authenticate.", true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Sign In to Dashboard";
  }
}

// Handle logout
async function handleAdminLogout() {
  if (isMockMode) {
    sessionStorage.removeItem("gram_dudh_admin_logged");
    showLoginScreen();
    showToast("Signed out from Mock Mode.");
  } else {
    try {
      await firebase.auth().signOut();
      showToast("Signed out successfully.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
}

// Load all collections and compute statistics
async function loadPortalData() {
  try {
    if (isMockMode) {
      orders = JSON.parse(localStorage.getItem("gram_dudh_orders") || "[]");
      customers = JSON.parse(localStorage.getItem("gram_dudh_customers") || "[]");
      subscriptions = JSON.parse(localStorage.getItem("gram_dudh_subscriptions") || "[]");
    } else {
      // Fetch from Firestore
      const ordersSnap = await db.collection("orders").orderBy("createdAt", "desc").get();
      orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const custSnap = await db.collection("customers").get();
      customers = custSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const subSnap = await db.collection("subscriptions").get();
      subscriptions = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    calculateStats();
    renderTable();

  } catch (error) {
    console.error("Error fetching data:", error);
    showToast("Error loading records from database.", true);
  }
}

// Get standard date strings: 'YYYY-MM-DD'
function getDateString(offsetDays = 0) {
  const date = new Date();
  if (offsetDays !== 0) {
    date.setDate(date.getDate() + offsetDays);
  }
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Calculate Metrics for Stats Cards
function calculateStats() {
  const todayStr = getDateString(0);
  const tomorrowStr = getDateString(1);

  // Today's Orders
  const todayOrders = orders.filter(o => o.deliveryDate === todayStr && o.status !== 'Cancelled');
  document.getElementById("val-today-orders").innerText = todayOrders.length;

  // Tomorrow's Deliveries
  const tomorrowOrders = orders.filter(o => o.deliveryDate === tomorrowStr && o.status !== 'Cancelled');
  document.getElementById("val-tomorrow-deliveries").innerText = tomorrowOrders.length;

  // Active Subscriptions
  const activeSubs = subscriptions.filter(s => s.status === "Active");
  document.getElementById("val-active-subs").innerText = activeSubs.length;

  // Today's Estimated Revenue (sum up orders set for delivery today)
  let revenue = 0;
  todayOrders.forEach(o => {
    revenue += getPrice(o.product) * o.quantity;
  });
  document.getElementById("val-today-revenue").innerText = revenue.toLocaleString() + " ৳";
}

// Switch between table views
function setFilter(filterType) {
  activeFilter = filterType;
  
  // Update buttons state
  const filterButtons = document.querySelectorAll(".admin-filters .filter-btn");
  filterButtons.forEach(btn => btn.classList.remove("active"));
  
  const idMap = {
    'today': 'btn-filter-today',
    'tomorrow': 'btn-filter-tomorrow',
    'all': 'btn-filter-all',
    'subscriptions': 'btn-filter-subs',
    'customers': 'btn-filter-customers'
  };
  
  document.getElementById(idMap[filterType]).classList.add("active");
  renderTable();
}

// Dynamically Render Table Columns and Rows
function renderTable() {
  const tableHead = document.getElementById("tableHead");
  const tableBody = document.getElementById("tableBody");
  
  if (!tableHead || !tableBody) return;

  // Clear previous values
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  const todayStr = getDateString(0);
  const tomorrowStr = getDateString(1);

  if (activeFilter === 'today' || activeFilter === 'tomorrow' || activeFilter === 'all') {
    // Render Orders Table
    tableHead.innerHTML = `
      <tr>
        <th>Date</th>
        <th>Customer</th>
        <th>Phone & WhatsApp</th>
        <th>Area & Landmark</th>
        <th>Product</th>
        <th>Qty</th>
        <th>Total</th>
        <th>Plan</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    `;

    let filteredOrders = [];
    if (activeFilter === 'today') {
      filteredOrders = orders.filter(o => o.deliveryDate === todayStr);
    } else if (activeFilter === 'tomorrow') {
      filteredOrders = orders.filter(o => o.deliveryDate === tomorrowStr);
    } else {
      filteredOrders = orders; // show all
    }

    if (filteredOrders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--muted); padding: 40px;">No order records found for this view.</td></tr>`;
      return;
    }

    filteredOrders.forEach(o => {
      const total = getPrice(o.product) * o.quantity;
      const row = document.createElement("tr");
      
      row.innerHTML = `
        <td style="font-weight: 500;">${o.deliveryDate}</td>
        <td>
          <div style="font-weight: 600;">${o.name}</div>
          <div style="font-size: 0.8rem; color: var(--muted); max-width: 180px; word-wrap: break-word;">${o.address}</div>
        </td>
        <td>
          <div>📞 ${o.phone}</div>
          <div style="font-size: 0.82rem; color: var(--green);">💬 ${o.whatsapp}</div>
        </td>
        <td>
          <div><strong>${o.area}</strong></div>
          <div style="font-size: 0.82rem; color: var(--muted);">${o.landmark}</div>
        </td>
        <td>
          <div style="font-weight: 500;">${o.product}</div>
        </td>
        <td>${o.quantity} ${o.product.includes("Ghee") ? "Kg" : "L"}</td>
        <td style="font-weight: 600; color: var(--brown);">${total} ৳</td>
        <td><span style="font-size:0.85rem;">${o.subscriptionType}</span></td>
        <td>
          <span class="badge badge-${o.status.toLowerCase()}">${o.status}</span>
        </td>
        <td>
          <select onchange="updateOrderStatus('${o.id}', this.value)" class="status-select">
            <option value="Pending" ${o.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Dispatched" ${o.status === "Dispatched" ? "selected" : ""}>Dispatched</option>
            <option value="Delivered" ${o.status === "Delivered" ? "selected" : ""}>Delivered</option>
            <option value="Cancelled" ${o.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
        </td>
      `;
      tableBody.appendChild(row);
    });

  } else if (activeFilter === 'subscriptions') {
    // Render Subscriptions Table
    tableHead.innerHTML = `
      <tr>
        <th>Start Date</th>
        <th>Customer Name</th>
        <th>Contact Phone</th>
        <th>Product Sourced</th>
        <th>Quantity</th>
        <th>Plan Type</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    `;

    if (subscriptions.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--muted); padding: 40px;">No active subscriptions found.</td></tr>`;
      return;
    }

    subscriptions.forEach(s => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.startDate || "N/A"}</td>
        <td style="font-weight: 600;">${s.customerName}</td>
        <td>📞 ${s.customerPhone}</td>
        <td>${s.product}</td>
        <td>${s.quantity} ${s.product.includes("Ghee") ? "Kg" : "L"}</td>
        <td><strong>${s.subscriptionType}</strong></td>
        <td>
          <span class="badge ${s.status === 'Active' ? 'badge-delivered' : 'badge-cancelled'}">${s.status}</span>
        </td>
        <td>
          <button onclick="toggleSubscriptionStatus('${s.id}', '${s.status}')" class="filter-btn" style="padding: 4px 10px; font-size: 0.8rem;">
            ${s.status === 'Active' ? 'Cancel Sub' : 'Activate Sub'}
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

  } else if (activeFilter === 'customers') {
    // Render Customers Table
    tableHead.innerHTML = `
      <tr>
        <th>Customer Name</th>
        <th>Phone</th>
        <th>WhatsApp</th>
        <th>Delivery Area</th>
        <th>Full Address</th>
        <th>Landmark</th>
        <th>Last Order Timestamp</th>
      </tr>
    `;

    if (customers.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--muted); padding: 40px;">No registered customers found yet.</td></tr>`;
      return;
    }

    customers.forEach(c => {
      const row = document.createElement("tr");
      const orderDate = c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "N/A";
      row.innerHTML = `
        <td style="font-weight: 600;">${c.name}</td>
        <td>📞 ${c.phone}</td>
        <td style="color: var(--green);">💬 ${c.whatsapp}</td>
        <td><strong>${c.area}</strong></td>
        <td style="max-width: 250px; font-size: 0.85rem; color: var(--muted);">${c.address}</td>
        <td style="font-size: 0.85rem;">${c.landmark || ""}</td>
        <td>${orderDate}</td>
      `;
      tableBody.appendChild(row);
    });
  }
}

// Update order status in db
async function updateOrderStatus(orderId, newStatus) {
  try {
    if (isMockMode) {
      const ordersList = JSON.parse(localStorage.getItem("gram_dudh_orders") || "[]");
      const orderIndex = ordersList.findIndex(o => o.id === orderId);
      if (orderIndex > -1) {
        ordersList[orderIndex].status = newStatus;
        localStorage.setItem("gram_dudh_orders", JSON.stringify(ordersList));
      }
    } else {
      await db.collection("orders").doc(orderId).update({
        status: newStatus
      });
    }

    showToast(`Order status updated to ${newStatus}`);
    loadPortalData(); // reload stats and tables

  } catch (error) {
    console.error("Error updating order status:", error);
    showToast("Failed to update status in database.", true);
  }
}

// Toggle Subscription Status
async function toggleSubscriptionStatus(subId, currentStatus) {
  const newStatus = currentStatus === "Active" ? "Cancelled" : "Active";
  try {
    if (isMockMode) {
      const subList = JSON.parse(localStorage.getItem("gram_dudh_subscriptions") || "[]");
      const subIndex = subList.findIndex(s => s.id === subId);
      if (subIndex > -1) {
        subList[subIndex].status = newStatus;
        localStorage.setItem("gram_dudh_subscriptions", JSON.stringify(subList));
      }
    } else {
      await db.collection("subscriptions").doc(subId).update({
        status: newStatus
      });
    }

    showToast(`Subscription status changed to ${newStatus}`);
    loadPortalData();

  } catch (error) {
    console.error("Error updating subscription:", error);
    showToast("Failed to toggle subscription status.", true);
  }
}

// Export current filtered view to CSV file (Excel & Sheets ready)
function exportToCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  let filename = "export_" + activeFilter + "_" + getDateString(0) + ".csv";
  
  if (activeFilter === 'today' || activeFilter === 'tomorrow' || activeFilter === 'all') {
    // Orders Export columns
    csvContent += "Delivery Date,Name,Phone,WhatsApp,Area,Landmark,Address,Product,Quantity,Total BDT,Plan,Status\n";
    
    let filteredOrders = [];
    const todayStr = getDateString(0);
    const tomorrowStr = getDateString(1);
    
    if (activeFilter === 'today') {
      filteredOrders = orders.filter(o => o.deliveryDate === todayStr);
    } else if (activeFilter === 'tomorrow') {
      filteredOrders = orders.filter(o => o.deliveryDate === tomorrowStr);
    } else {
      filteredOrders = orders;
    }

    if (filteredOrders.length === 0) {
      showToast("No orders available to export.", true);
      return;
    }

    filteredOrders.forEach(o => {
      const total = getPrice(o.product) * o.quantity;
      const cleanAddress = o.address.replace(/"/g, '""').replace(/\n/g, ' ');
      const cleanLandmark = o.landmark.replace(/"/g, '""');
      
      const row = [
        o.deliveryDate,
        `"${o.name}"`,
        `"${o.phone}"`,
        `"${o.whatsapp}"`,
        `"${o.area}"`,
        `"${cleanLandmark}"`,
        `"${cleanAddress}"`,
        `"${o.product}"`,
        o.quantity,
        total,
        `"${o.subscriptionType}"`,
        `"${o.status}"`
      ].join(",");
      csvContent += row + "\n";
    });

  } else if (activeFilter === 'subscriptions') {
    csvContent += "Start Date,Customer Name,Phone,Product,Quantity,Plan Type,Status\n";
    
    if (subscriptions.length === 0) {
      showToast("No subscriptions available to export.", true);
      return;
    }

    subscriptions.forEach(s => {
      const row = [
        s.startDate || "N/A",
        `"${s.customerName}"`,
        `"${s.customerPhone}"`,
        `"${s.product}"`,
        s.quantity,
        `"${s.subscriptionType}"`,
        `"${s.status}"`
      ].join(",");
      csvContent += row + "\n";
    });

  } else if (activeFilter === 'customers') {
    csvContent += "Customer Name,Phone,WhatsApp,Area,Landmark,Address,Last Order Date\n";
    
    if (customers.length === 0) {
      showToast("No customer records available to export.", true);
      return;
    }

    customers.forEach(c => {
      const cleanAddress = c.address.replace(/"/g, '""').replace(/\n/g, ' ');
      const cleanLandmark = c.landmark ? c.landmark.replace(/"/g, '""') : "";
      
      const row = [
        `"${c.name}"`,
        `"${c.phone}"`,
        `"${c.whatsapp}"`,
        `"${c.area}"`,
        `"${cleanLandmark}"`,
        `"${cleanAddress}"`,
        c.lastOrderAt || "N/A"
      ].join(",");
      csvContent += row + "\n";
    });
  }

  // Create downloader link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast("CSV Downloaded! Ready to import into Google Sheets.");
}

// Helper to get prices
function getPrice(productName) {
  if (productName === "Daily Raw Cow Milk") return 80;
  if (productName === "Full Cream Village Milk") return 95;
  if (productName === "Premium Village Cow Ghee") return 1200;
  return 0;
}

// Show custom toast notification
function showToast(message, isError = false) {
  const toast = document.getElementById("toastMessage");
  const toastText = document.getElementById("toastText");
  const toastIcon = document.getElementById("toastIcon");

  if (toast && toastText && toastIcon) {
    toastText.innerText = message;
    toastIcon.innerText = isError ? "❌" : "✅";
    
    if (isError) {
      toast.classList.add("error");
    } else {
      toast.classList.remove("error");
    }
    
    toast.style.display = "flex";
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      toast.style.display = "none";
    }, 3000);
  }
}

// Initialize portal on load
window.addEventListener("DOMContentLoaded", () => {
  initializeAdminPortal();
});
