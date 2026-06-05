// ════════════════════════════════════════
// SHIKOR ADMIN PORTAL v3.0
// Pro Marketplace Dashboard with Image Upload
// ════════════════════════════════════════

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1xvrgTpoldBiMkPi4YkRB3f35j7wgkBY",
  authDomain: "dudhwala-13a69.firebaseapp.com",
  projectId: "dudhwala-13a69",
  storageBucket: "dudhwala-13a69.firebasestorage.app",
  messagingSenderId: "360751875123",
  appId: "1:360751875123:web:dd56e1cd1f0ad8e01d4f46"
};

// Global State
let db = null;
let storage = null;
let isMockMode = false;
let activeTab = "dashboard";
let activeOrderFilter = "All";
let orderSearchTerm = "";
let prodSearchTerm = "";
let custSearchTerm = "";
let catSearchTerm = "";

// Data Arrays
let categories = [];
let products = [];
let orders = [];
let customers = [];
let coupons = [];
let settings = {};

// ════════════════════════════════════════
// INIT
// ════════════════════════════════════════
window.addEventListener("DOMContentLoaded", () => {
  initializeAdminPortal();
});

function initializeAdminPortal() {
  const urlParams = new URLSearchParams(window.location.search);
  const forceMock = urlParams.has('mock');
  const isDefaultConfig = forceMock || !firebaseConfig.apiKey || firebaseConfig.projectId.includes("YOUR_PROJECT");

  if (isDefaultConfig) {
    console.warn("Admin running in MOCK MODE (localStorage).");
    isMockMode = true;
    updateModeBadge();
    setupMockSession();
  } else {
    try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      storage = firebase.storage();
      updateModeBadge();
      firebase.auth().onAuthStateChanged((user) => {
        if (user) showDashboard(user.email);
        else showLoginScreen();
      });
    } catch (error) {
      console.error("Firebase failed. Switching to Mock Mode.", error);
      isMockMode = true;
      updateModeBadge();
      setupMockSession();
    }
  }
}

function updateModeBadge() {
  const label = isMockMode ? "🔧 Mock Mode" : "🔥 Firebase Live";
  const el1 = document.getElementById("sidebarModeBadge");
  const el2 = document.getElementById("adminModeBadge");
  if (el1) el1.textContent = label;
  if (el2) el2.textContent = label;
}

function setupMockSession() {
  const logged = sessionStorage.getItem("shikor_admin_logged") === "true";
  if (logged) showDashboard("borhankustia@gmail.com");
  else showLoginScreen();
}

function showDashboard(email) {
  document.getElementById("authOverlay").style.display = "none";
  document.getElementById("dashboardWrapper").style.display = "block";
  document.getElementById("adminUserEmail").innerText = email;
  loadPortalData();
}

function showLoginScreen() {
  document.getElementById("authOverlay").style.display = "flex";
  document.getElementById("dashboardWrapper").style.display = "none";
}

// ════════════════════════════════════════
// MOBILE SIDEBAR TOGGLE
// ════════════════════════════════════════
window.toggleMobileSidebar = function() {
  const sidebar = document.getElementById("adminSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  sidebar.classList.toggle("mobile-open");
  overlay.classList.toggle("visible");
};

window.closeMobileSidebar = function() {
  document.getElementById("adminSidebar").classList.remove("mobile-open");
  document.getElementById("sidebarOverlay").classList.remove("visible");
};

// ════════════════════════════════════════
// AUTHENTICATION
// ════════════════════════════════════════
async function handleAdminLogin(event) {
  event.preventDefault();
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value.trim();
  const btn = document.getElementById("btn-login-submit");

  btn.disabled = true;
  btn.innerHTML = `<span class="upload-spinner"></span> Authenticating...`;

  try {
    if (isMockMode) {
      if (email === "borhankustia@gmail.com" && password === "Eusuf#") {
        sessionStorage.setItem("shikor_admin_logged", "true");
        showDashboard(email);
        showToast("Logged in (Mock Mode) ✅");
      } else {
        throw new Error("Invalid credentials. Use: borhankustia@gmail.com / Eusuf#");
      }
    } else {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      showToast("Access granted! Welcome back 🎉");
    }
  } catch (error) {
    showToast(error.message || "Authentication failed.", true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Sign In to Dashboard";
  }
}

async function handleAdminLogout() {
  if (isMockMode) {
    sessionStorage.removeItem("shikor_admin_logged");
    showLoginScreen();
    showToast("Signed out.");
  } else {
    try {
      await firebase.auth().signOut();
      showToast("Signed out successfully.");
    } catch (e) { console.error(e); }
  }
}

// ════════════════════════════════════════
// DATA LOADING
// ════════════════════════════════════════
async function loadPortalData() {
  try {
    if (isMockMode) {
      categories = JSON.parse(localStorage.getItem("shikor_categories") || "[]");
      products   = JSON.parse(localStorage.getItem("shikor_products")   || "[]");
      orders     = JSON.parse(localStorage.getItem("shikor_orders")     || "[]");
      customers  = JSON.parse(localStorage.getItem("shikor_customers")  || "[]");
      coupons    = JSON.parse(localStorage.getItem("shikor_coupons")    || "[]");
      settings   = JSON.parse(localStorage.getItem("shikor_settings")  || "{}");
    } else {
      const [catSnap, prodSnap, ordSnap, custSnap, coupSnap, setDoc] = await Promise.all([
        db.collection("categories").get(),
        db.collection("products").get(),
        db.collection("orders").orderBy("createdAt", "desc").get(),
        db.collection("customers").get(),
        db.collection("coupons").get(),
        db.collection("settings").doc("store_settings").get()
      ]);
      categories = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      products   = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      orders     = ordSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      customers  = custSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      coupons    = coupSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      settings   = setDoc.exists ? setDoc.data() : {};
    }
    renderActiveTab();
  } catch (error) {
    console.error("Portal fetch error:", error);
    showToast("Failed to fetch records.", true);
  }
}

function saveMockState(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ════════════════════════════════════════
// IMAGE UPLOAD SYSTEM
// ════════════════════════════════════════

// Drag-and-drop handlers
window.handleDragOver = function(event, zoneId) {
  event.preventDefault();
  document.getElementById(zoneId).classList.add("drag-over");
};
window.handleDragLeave = function(zoneId) {
  document.getElementById(zoneId).classList.remove("drag-over");
};
window.handleDrop = function(event, fileInputId, previewId, dataFieldId) {
  event.preventDefault();
  const zoneId = event.currentTarget.id;
  document.getElementById(zoneId).classList.remove("drag-over");
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    processImageFile(files[0], previewId, dataFieldId);
  }
};

// File input change handler
window.handleFileSelect = function(input, previewId, dataFieldId) {
  if (input.files && input.files[0]) {
    processImageFile(input.files[0], previewId, dataFieldId);
  }
};

// Core image processor: resize → base64 or Storage upload
function processImageFile(file, previewId, dataFieldId) {
  if (!file.type.startsWith("image/")) {
    showToast("Please select an image file (JPG, PNG, WebP, etc.)", true);
    return;
  }

  const maxSizeMB = 5;
  if (file.size > maxSizeMB * 1024 * 1024) {
    showToast(`Image too large. Max ${maxSizeMB}MB.`, true);
    return;
  }

  // Show preview name & size immediately
  const previewWrap = document.getElementById(previewId);
  const previewImg  = previewWrap.querySelector("img");
  const nameEl      = previewWrap.querySelector(".img-preview-name");
  const sizeEl      = previewWrap.querySelector(".img-preview-size");

  nameEl.textContent = file.name;
  sizeEl.textContent = formatFileSize(file.size);

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    // Resize image to max 800px wide before storing
    resizeImage(dataUrl, 800, (resizedDataUrl) => {
      previewImg.src = resizedDataUrl;
      previewWrap.classList.add("visible");
      document.getElementById(dataFieldId).value = resizedDataUrl;
    });
  };
  reader.readAsDataURL(file);
}

// Canvas-based image resizer
function resizeImage(dataUrl, maxWidth, callback) {
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement("canvas");
    let w = img.width, h = img.height;
    if (w > maxWidth) {
      h = Math.round(h * maxWidth / w);
      w = maxWidth;
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    callback(canvas.toDataURL("image/jpeg", 0.82));
  };
  img.src = dataUrl;
}

// Upload image to Firebase Storage (production mode)
async function uploadToStorage(dataUrl, path) {
  if (isMockMode || !storage) return dataUrl; // In mock mode just use base64
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const ref = storage.ref(path);
    await ref.put(blob);
    const downloadUrl = await ref.getDownloadURL();
    return downloadUrl;
  } catch (e) {
    console.error("Storage upload failed:", e);
    return dataUrl; // Fallback to base64
  }
}

// Clear image field helper
window.clearImageField = function(previewId, dataFieldId, zoneId) {
  document.getElementById(previewId).classList.remove("visible");
  document.getElementById(previewId).querySelector("img").src = "";
  document.getElementById(dataFieldId).value = "";
};

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// ════════════════════════════════════════
// TOAST ALERTS
// ════════════════════════════════════════
function showToast(message, isError = false) {
  const toast = document.getElementById("toastMessage");
  const toastText = document.getElementById("toastText");
  const toastIcon = document.getElementById("toastIcon");
  if (toast && toastText && toastIcon) {
    toastText.innerText = message;
    toastIcon.innerText = isError ? "❌" : "✅";
    toast.classList.toggle("error", isError);
    toast.style.display = "flex";
    setTimeout(() => { toast.style.display = "none"; }, 3500);
  }
}

// ════════════════════════════════════════
// TAB SWITCHING
// ════════════════════════════════════════
window.switchAdminTab = function(tabName) {
  activeTab = tabName;
  closeMobileSidebar();

  document.querySelectorAll(".admin-sidebar-link").forEach(link => {
    link.classList.remove("active");
    if (link.innerText.toLowerCase().includes(tabName.toLowerCase())) {
      link.classList.add("active");
    }
  });

  document.querySelectorAll(".admin-page-section").forEach(sec => sec.classList.remove("active"));
  const target = document.getElementById(`admin-sec-${tabName}`);
  if (target) target.classList.add("active");

  renderActiveTab();
};

function renderActiveTab() {
  const handlers = {
    dashboard:  renderDashboard,
    categories: renderCategories,
    products:   renderProducts,
    orders:     renderOrders,
    customers:  renderCustomers,
    inventory:  renderInventory,
    coupons:    renderCoupons,
    reports:    renderReports,
    settings:   renderSettings,
  };
  if (handlers[activeTab]) handlers[activeTab]();
}

// ════════════════════════════════════════
// 1. DASHBOARD
// ════════════════════════════════════════
function renderDashboard() {
  const totalRevenue = orders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + (o.total || 0), 0);
  document.getElementById("kpi-revenue").innerText = totalRevenue.toLocaleString() + " ৳";
  document.getElementById("kpi-orders").innerText = orders.length;
  document.getElementById("kpi-customers").innerText = customers.length;
  document.getElementById("kpi-lowstock").innerText = products.filter(p => p.stock < 10).length;

  const tbody = document.getElementById("dashboard-recent-orders-list");
  if (tbody) {
    tbody.innerHTML = "";
    const recent = orders.slice(0, 5);
    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px;">No orders yet.</td></tr>`;
      return;
    }
    recent.forEach(o => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="font-weight:700;font-size:0.85rem;">${o.id}</td>
        <td>${o.name || "—"}</td>
        <td>${o.phone || "—"}</td>
        <td>${o.district || "—"}</td>
        <td style="font-weight:700;color:var(--green);">${(o.total || 0)} ৳</td>
        <td>${o.paymentMethod || "—"}</td>
        <td><span class="badge badge-${(o.status || 'pending').toLowerCase()}">${o.status || 'Pending'}</span></td>
      `;
      tbody.appendChild(row);
    });
  }
  drawSalesChart();
}

function drawSalesChart() {
  const container = document.getElementById("sales-chart-container");
  if (!container) return;
  container.innerHTML = "";
  const days = [], salesMap = {};
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    days.push(dateStr);
    salesMap[dateStr] = 0;
  }
  orders.filter(o => o.status !== "Cancelled").forEach(o => {
    if (o.createdAt) {
      const day = o.createdAt.split("T")[0];
      if (salesMap[day] !== undefined) salesMap[day] += (o.total || 0);
    }
  });
  const maxSale = Math.max(...Object.values(salesMap), 1000);
  days.forEach(day => {
    const total = salesMap[day];
    const heightPercent = Math.min(100, Math.round((total / maxSale) * 100));
    const formattedDate = new Date(day + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const bar = document.createElement("div");
    bar.className = "chart-bar-item";
    bar.style.height = `${Math.max(5, heightPercent)}%`;
    bar.innerHTML = `
      <div class="chart-bar-tooltip">${total} ৳</div>
      <div class="chart-bar-label">${formattedDate}</div>
    `;
    container.appendChild(bar);
  });
}

// ════════════════════════════════════════
// 2. CATEGORIES
// ════════════════════════════════════════
function renderCategories() {
  const tbody = document.getElementById("admin-categories-list");
  if (!tbody) return;
  renderCategoriesFiltered(categories);
}

function renderCategoriesFiltered(list) {
  const tbody = document.getElementById("admin-categories-list");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px;">No categories found.</td></tr>`;
    return;
  }
  list.forEach(cat => {
    const imgSrc = cat.imagePath || cat.imageData || "images/daily_milk.png";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${imgSrc}" class="prod-thumb" onerror="this.src='images/daily_milk.png'"></td>
      <td>
        <div style="font-weight:700;">${cat.nameEn}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);">${cat.nameBn}</div>
      </td>
      <td><span class="badge ${cat.status === 'Active' ? 'badge-delivered' : 'badge-cancelled'}">${cat.status}</span></td>
      <td>
        <button onclick="editCategory('${cat.id}')" style="background:var(--green-glow);border:none;cursor:pointer;padding:6px 10px;border-radius:6px;font-size:0.85rem;color:var(--green);font-weight:700;margin-right:6px;">✏️ Edit</button>
        <button onclick="deleteCategory('${cat.id}')" style="background:hsla(6,78%,57%,0.1);border:none;cursor:pointer;padding:6px 10px;border-radius:6px;font-size:0.85rem;color:#e74c3c;font-weight:700;">🗑️ Del</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.filterCategoriesTable = function(term) {
  catSearchTerm = term.toLowerCase();
  const filtered = categories.filter(c =>
    c.nameEn.toLowerCase().includes(catSearchTerm) ||
    c.nameBn.toLowerCase().includes(catSearchTerm)
  );
  renderCategoriesFiltered(filtered);
};

async function handleSaveCategory(event) {
  event.preventDefault();
  // Use getElementById - event.submitter can be null in some browsers
  const btn = document.getElementById("btn-save-category");
  const idInput = document.getElementById("editCategoryId").value;
  const nameEn  = document.getElementById("catNameEn").value.trim();
  const nameBn  = document.getElementById("catNameBn").value.trim();
  const descEn  = document.getElementById("catDescEn").value.trim();
  const descBn  = document.getElementById("catDescBn").value.trim();
  const status  = document.getElementById("catStatus").value;
  const imageData = document.getElementById("catImageData").value;

  if (!imageData && !idInput) {
    showToast("Please upload a category image first.", true);
    return;
  }

  if (btn) { btn.disabled = true; btn.innerHTML = `<span class="upload-spinner"></span> Saving...`; }

  try {
    const catId = idInput || "cat_" + Math.random().toString(36).substr(2, 9);
    let imagePath = imageData;

    // Production: upload base64 → Firebase Storage
    if (!isMockMode && imageData && imageData.startsWith("data:")) {
      imagePath = await uploadToStorage(imageData, `categories/${catId}.jpg`);
    }

    // Edit without new image → keep old imagePath
    if (!imageData && idInput) {
      const old = categories.find(c => c.id === idInput);
      imagePath = old ? (old.imagePath || old.imageData || "") : "";
    }

    const data = {
      id: catId, nameEn, nameBn,
      descriptionEn: descEn, descriptionBn: descBn,
      imagePath, status,
      createdAt: new Date().toISOString()
    };

    if (isMockMode) {
      const idx = categories.findIndex(c => c.id === catId);
      if (idx > -1) categories[idx] = data;
      else categories.push(data);
      saveMockState("shikor_categories", categories);
    } else {
      await db.collection("categories").doc(catId).set(data);
    }

    showToast("Category saved! ✅");
    resetCategoryForm();
    await loadPortalData();
  } catch (error) {
    console.error("Save category error:", error);
    showToast("Failed to save category: " + (error.message || ""), true);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = "Save Category"; }
  }
}

window.editCategory = function(id) {
  const cat = categories.find(c => c.id === id);
  if (!cat) return;
  document.getElementById("editCategoryId").value = cat.id;
  document.getElementById("catNameEn").value = cat.nameEn;
  document.getElementById("catNameBn").value = cat.nameBn;
  document.getElementById("catDescEn").value = cat.descriptionEn || "";
  document.getElementById("catDescBn").value = cat.descriptionBn || "";
  document.getElementById("catStatus").value = cat.status;
  document.getElementById("cat-form-title").innerText = "Edit Category";

  // Restore image preview
  const imgSrc = cat.imagePath || cat.imageData || "";
  if (imgSrc) {
    const previewWrap = document.getElementById("catImgPreview");
    previewWrap.querySelector("img").src = imgSrc;
    previewWrap.querySelector(".img-preview-name").textContent = "Current image";
    previewWrap.querySelector(".img-preview-size").textContent = imgSrc.startsWith("data:") ? "Stored locally" : imgSrc.split("/").pop();
    previewWrap.classList.add("visible");
    document.getElementById("catImageData").value = imgSrc;
  }
  // Scroll form into view
  document.getElementById("adminCategoryForm").scrollIntoView({ behavior: "smooth" });
};

window.resetCategoryForm = function() {
  document.getElementById("adminCategoryForm").reset();
  document.getElementById("editCategoryId").value = "";
  document.getElementById("cat-form-title").innerText = "Add Category";
  clearImageField("catImgPreview", "catImageData", "catUploadZone");
};

async function deleteCategory(id) {
  if (!confirm("Delete this category? Products in it will have no category.")) return;
  try {
    if (isMockMode) {
      categories = categories.filter(c => c.id !== id);
      saveMockState("shikor_categories", categories);
    } else {
      await db.collection("categories").doc(id).delete();
    }
    showToast("Category deleted.");
    loadPortalData();
  } catch (e) {
    showToast("Failed to delete category.", true);
  }
}

// ════════════════════════════════════════
// 3. PRODUCTS
// ════════════════════════════════════════
function renderProducts() {
  const select = document.getElementById("prodCategory");
  if (select) {
    select.innerHTML = `<option value="" disabled selected>Select Category</option>`;
    categories.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.innerText = c.nameEn;
      select.appendChild(opt);
    });
  }
  renderProductsFiltered(products);
}

function renderProductsFiltered(list) {
  const tbody = document.getElementById("admin-products-list");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px;">No products found.</td></tr>`;
    return;
  }
  list.forEach(p => {
    const cat = categories.find(c => c.id === p.categoryId);
    const catName = cat ? cat.nameEn : "—";
    const imgSrc = p.imagePath || p.imageData || "images/daily_milk.png";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="prod-name-cell">
          <img src="${imgSrc}" class="prod-thumb" onerror="this.src='images/daily_milk.png'">
          <div>
            <div style="font-weight:700;">${p.nameEn}</div>
            <div style="font-size:0.78rem;color:var(--text-muted);">${p.nameBn}</div>
          </div>
        </div>
      </td>
      <td>${catName}</td>
      <td>
        <div style="font-weight:700;color:var(--green);">${p.price} ৳</div>
        ${p.discountPrice > 0 ? `<div style="font-size:0.75rem;color:var(--text-muted);text-decoration:line-through;">${p.discountPrice} ৳</div>` : ""}
      </td>
      <td>${p.stock} ${p.unitEn || ""}</td>
      <td><span class="badge ${p.isFeatured ? 'badge-delivered' : 'badge-cancelled'}">${p.isFeatured ? '⭐ Yes' : 'No'}</span></td>
      <td>
        <span class="badge ${p.inStock ? 'badge-delivered' : 'badge-cancelled'}" style="cursor:pointer;" onclick="toggleProductStockState('${p.id}')">
          ${p.inStock ? '✅ In Stock' : '⛔ Out'}
        </span>
      </td>
      <td>
        <button onclick="openProductCrudModal('${p.id}')" style="background:var(--green-glow);border:none;cursor:pointer;padding:6px 10px;border-radius:6px;font-size:0.85rem;color:var(--green);font-weight:700;margin-right:6px;">✏️</button>
        <button onclick="deleteProduct('${p.id}')" style="background:hsla(6,78%,57%,0.1);border:none;cursor:pointer;padding:6px 10px;border-radius:6px;font-size:0.85rem;color:#e74c3c;font-weight:700;">🗑️</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.filterProductsTable = function(term) {
  prodSearchTerm = term.toLowerCase();
  const filtered = products.filter(p =>
    p.nameEn.toLowerCase().includes(prodSearchTerm) ||
    p.nameBn.toLowerCase().includes(prodSearchTerm) ||
    (categories.find(c => c.id === p.categoryId)?.nameEn || "").toLowerCase().includes(prodSearchTerm)
  );
  renderProductsFiltered(filtered);
};

window.openProductCrudModal = function(id = "") {
  const modal = document.getElementById("productModal");
  if (!modal) return;

  document.getElementById("productForm").reset();
  document.getElementById("editProductId").value = "";
  document.getElementById("productModalTitle").innerText = "Add New Product";
  clearImageField("prodImgPreview", "prodImageData", "prodUploadZone");

  // Re-populate category select
  const select = document.getElementById("prodCategory");
  select.innerHTML = `<option value="" disabled selected>Select Category</option>`;
  categories.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.innerText = c.nameEn;
    select.appendChild(opt);
  });

  if (id) {
    const p = products.find(prod => prod.id === id);
    if (p) {
      document.getElementById("editProductId").value     = p.id;
      document.getElementById("prodNameEn").value        = p.nameEn;
      document.getElementById("prodNameBn").value        = p.nameBn;
      document.getElementById("prodCategory").value      = p.categoryId;
      document.getElementById("prodStock").value         = p.stock;
      document.getElementById("prodPrice").value         = p.price;
      document.getElementById("prodDiscountPrice").value = p.discountPrice || 0;
      document.getElementById("prodUnitEn").value        = p.unitEn;
      document.getElementById("prodUnitBn").value        = p.unitBn;
      document.getElementById("prodBadgeEn").value       = p.badgeEn || "";
      document.getElementById("prodBadgeBn").value       = p.badgeBn || "";
      document.getElementById("prodInStock").checked     = p.inStock;
      document.getElementById("prodIsFeatured").checked  = p.isFeatured;
      document.getElementById("prodDescEn").value        = p.descEn || "";
      document.getElementById("prodDescBn").value        = p.descBn || "";
      document.getElementById("productModalTitle").innerText = "Edit Product";

      // Restore image preview
      const imgSrc = p.imagePath || p.imageData || "";
      if (imgSrc) {
        const previewWrap = document.getElementById("prodImgPreview");
        previewWrap.querySelector("img").src = imgSrc;
        previewWrap.querySelector(".img-preview-name").textContent = "Current image";
        previewWrap.querySelector(".img-preview-size").textContent = imgSrc.startsWith("data:") ? "Stored locally" : imgSrc.split("/").pop();
        previewWrap.classList.add("visible");
        document.getElementById("prodImageData").value = imgSrc;
      }
    }
  }
  modal.style.display = "flex";
};

window.closeProductCrudModal = function() {
  const modal = document.getElementById("productModal");
  if (modal) modal.style.display = "none";
};

async function handleSaveProduct(event) {
  event.preventDefault();
  const btn = document.getElementById("btn-save-product");
  const idInput   = document.getElementById("editProductId").value;
  const imageData = document.getElementById("prodImageData").value;

  if (!imageData && !idInput) {
    showToast("Please upload a product image first.", true);
    return;
  }

  if (btn) { btn.disabled = true; btn.innerHTML = `<span class="upload-spinner"></span> Saving...`; }

  try {
    const pid = idInput || "prod_" + Math.random().toString(36).substr(2, 9);
    let imagePath = imageData;

    // Production: upload base64 → Firebase Storage
    if (!isMockMode && imageData && imageData.startsWith("data:")) {
      imagePath = await uploadToStorage(imageData, `products/${pid}.jpg`);
    }

    // Edit without new image → keep old
    if (!imageData && idInput) {
      const old = products.find(p => p.id === idInput);
      imagePath = old ? (old.imagePath || old.imageData || "") : "";
    }

    const data = {
      id: pid,
      categoryId:    document.getElementById("prodCategory").value,
      nameEn:        document.getElementById("prodNameEn").value.trim(),
      nameBn:        document.getElementById("prodNameBn").value.trim(),
      stock:         parseInt(document.getElementById("prodStock").value, 10),
      price:         parseInt(document.getElementById("prodPrice").value, 10),
      discountPrice: parseInt(document.getElementById("prodDiscountPrice").value, 10) || 0,
      unitEn:        document.getElementById("prodUnitEn").value.trim(),
      unitBn:        document.getElementById("prodUnitBn").value.trim(),
      badgeEn:       document.getElementById("prodBadgeEn").value.trim(),
      badgeBn:       document.getElementById("prodBadgeBn").value.trim(),
      imagePath,
      inStock:       document.getElementById("prodInStock").checked,
      isFeatured:    document.getElementById("prodIsFeatured").checked,
      descEn:        document.getElementById("prodDescEn").value.trim(),
      descBn:        document.getElementById("prodDescBn").value.trim(),
      benefitsEn: ["Authentic quality sourced", "Direct from village producers", "No additives"],
      benefitsBn: ["বিশুদ্ধতার নিশ্চয়তা", "সরাসরি গ্রাম থেকে সংগৃহীত", "কোনো ভেজাল নেই"],
      createdAt: new Date().toISOString()
    };

    if (isMockMode) {
      const idx = products.findIndex(p => p.id === pid);
      if (idx > -1) products[idx] = data;
      else products.push(data);
      saveMockState("shikor_products", products);
    } else {
      await db.collection("products").doc(pid).set(data);
    }

    showToast("Product saved! ✅");
    closeProductCrudModal();
    await loadPortalData();
  } catch (error) {
    console.error("Save product failure:", error);
    showToast("Failed to save product: " + (error.message || ""), true);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = "💾 Save Product"; }
  }
}

window.toggleProductStockState = async function(id) {
  const p = products.find(prod => prod.id === id);
  if (!p) return;
  p.inStock = !p.inStock;
  try {
    if (isMockMode) {
      saveMockState("shikor_products", products);
    } else {
      await db.collection("products").doc(id).update({ inStock: p.inStock });
    }
    showToast(`Stock → ${p.inStock ? "✅ In Stock" : "⛔ Out of Stock"}`);
    loadPortalData();
  } catch (e) {
    console.error("Toggle stock failed:", e);
  }
};

async function deleteProduct(id) {
  if (!confirm("Delete this product permanently?")) return;
  try {
    if (isMockMode) {
      products = products.filter(p => p.id !== id);
      saveMockState("shikor_products", products);
    } else {
      await db.collection("products").doc(id).delete();
    }
    showToast("Product deleted.");
    loadPortalData();
  } catch (e) {
    showToast("Failed to delete product.", true);
  }
}

// ════════════════════════════════════════
// 4. ORDERS
// ════════════════════════════════════════
function renderOrders() {
  const tbody = document.getElementById("admin-orders-list");
  if (!tbody) return;
  let filtered = [...orders];
  if (activeOrderFilter !== "All") {
    filtered = filtered.filter(o => o.status === activeOrderFilter);
  }
  if (orderSearchTerm) {
    filtered = filtered.filter(o =>
      (o.name || "").toLowerCase().includes(orderSearchTerm) ||
      (o.phone || "").includes(orderSearchTerm) ||
      (o.id || "").toLowerCase().includes(orderSearchTerm)
    );
  }
  tbody.innerHTML = "";
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px;">No orders found.</td></tr>`;
    return;
  }
  filtered.forEach(o => {
    const row = document.createElement("tr");
    let itemsStr = "";
    if (Array.isArray(o.items)) {
      itemsStr = o.items.map(i => `${i.nameEn || i.name} (×${i.quantity})`).join("<br>");
    } else {
      itemsStr = `${o.product || "—"} (×${o.quantity || 1})`;
    }
    const displayDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—";
    row.innerHTML = `
      <td style="font-weight:700;font-size:0.82rem;">${o.id}<br><span style="font-size:0.72rem;color:var(--text-muted);font-weight:normal;">${displayDate}</span></td>
      <td><strong>${o.name || "—"}</strong><br><span style="font-size:0.8rem;color:var(--text-muted);">${o.address || ""}</span></td>
      <td>📞 ${o.phone || "—"}<br><span style="color:var(--green);font-size:0.82rem;">💬 ${o.whatsapp || "—"}</span></td>
      <td style="font-size:0.82rem;">${itemsStr}</td>
      <td style="font-weight:700;color:var(--green);">${o.total || 0} ৳</td>
      <td>${o.paymentMethod || "—"}<br><span style="font-size:0.72rem;font-weight:700;">${o.paymentStatus || ""}</span></td>
      <td><span class="badge badge-${(o.status || 'pending').toLowerCase()}">${o.status || "Pending"}</span></td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)">
          ${["Pending","Confirmed","Processing","Packed","Out For Delivery","Delivered","Cancelled"]
            .map(s => `<option value="${s}" ${o.status === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.filterAdminOrders = function(status) {
  activeOrderFilter = status;
  document.querySelectorAll("#orders-status-filters .filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.innerText.includes(status));
  });
  renderOrders();
};

window.filterOrdersTable = function(term) {
  orderSearchTerm = term.toLowerCase();
  renderOrders();
};

window.updateOrderStatus = async function(orderId, nextStatus) {
  try {
    if (isMockMode) {
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx > -1) {
        orders[idx].status = nextStatus;
        if (nextStatus === "Delivered") orders[idx].paymentStatus = "Paid";
        saveMockState("shikor_orders", orders);
      }
    } else {
      const payload = { status: nextStatus };
      if (nextStatus === "Delivered") payload.paymentStatus = "Paid";
      await db.collection("orders").doc(orderId).update(payload);
    }
    showToast(`Order → ${nextStatus} ✅`);
    loadPortalData();
  } catch (e) { console.error("Status update failed:", e); }
};

window.exportOrdersToCSV = function() {
  if (orders.length === 0) { showToast("No orders to export.", true); return; }
  let csv = "Order ID,Date,Name,Phone,WhatsApp,District,Address,Subtotal,Discount,Shipping,Total,Method,Payment Status,Status\n";
  orders.forEach(o => {
    const addr = (o.address || "").replace(/"/g, '""').replace(/\n/g, ' ');
    csv += `${o.id},${(o.createdAt||"").split("T")[0]},"${o.name}","${o.phone}","${o.whatsapp||""}","${o.district||""}","${addr}",${o.subtotal||0},${o.discount||0},${o.deliveryCharge||0},${o.total||0},"${o.paymentMethod||""}","${o.paymentStatus||""}","${o.status||""}"\n`;
  });
  const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  const link = document.createElement("a");
  link.setAttribute("href", uri);
  link.setAttribute("download", `shikor_orders_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Orders exported! 📥");
};

// ════════════════════════════════════════
// 5. CUSTOMERS
// ════════════════════════════════════════
function renderCustomers() {
  renderCustomersFiltered(customers);
}

function renderCustomersFiltered(list) {
  const tbody = document.getElementById("admin-customers-list");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px;">No customers found.</td></tr>`;
    return;
  }
  list.forEach(c => {
    const row = document.createElement("tr");
    const date = c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleString() : "—";
    row.innerHTML = `
      <td style="font-weight:700;">${c.name || "—"}</td>
      <td>${c.email || "—"}</td>
      <td>📞 ${c.phone || "—"}</td>
      <td><strong>${c.district || "—"}</strong></td>
      <td style="font-size:0.85rem;color:var(--text-muted);">${c.address || "—"}</td>
      <td>${date}</td>
    `;
    tbody.appendChild(row);
  });
}

window.filterCustomersTable = function(term) {
  custSearchTerm = term.toLowerCase();
  const filtered = customers.filter(c =>
    (c.name || "").toLowerCase().includes(custSearchTerm) ||
    (c.phone || "").includes(custSearchTerm)
  );
  renderCustomersFiltered(filtered);
};

// ════════════════════════════════════════
// 6. INVENTORY
// ════════════════════════════════════════
function renderInventory() {
  const tbody = document.getElementById("admin-inventory-list");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px;">No products in inventory.</td></tr>`;
    return;
  }
  products.forEach(p => {
    const imgSrc = p.imagePath || p.imageData || "images/daily_milk.png";
    const warning = p.stock < 10 ?
      `<span class="badge badge-cancelled">⚠️ Low Stock</span>` :
      `<span class="badge badge-delivered">✅ Healthy</span>`;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="prod-name-cell">
          <img src="${imgSrc}" class="prod-thumb" onerror="this.src='images/daily_milk.png'">
          <span style="font-weight:700;">${p.nameEn}</span>
        </div>
      </td>
      <td>${p.unitEn || "—"}</td>
      <td style="font-weight:700; font-size:1.1rem;">${p.stock}</td>
      <td>
        <input type="number" min="0" value="${p.stock}" onchange="updateStockLevels('${p.id}', this.value)" 
               style="width:80px;padding:6px 10px;border:1.5px solid #E8D9C8;border-radius:6px;text-align:center;font-family:'Outfit',sans-serif;">
      </td>
      <td>${warning}</td>
    `;
    tbody.appendChild(row);
  });
}

window.updateStockLevels = async function(id, val) {
  const stock = parseInt(val, 10);
  if (isNaN(stock) || stock < 0) return;
  try {
    if (isMockMode) {
      const idx = products.findIndex(p => p.id === id);
      if (idx > -1) {
        products[idx].stock = stock;
        products[idx].inStock = stock > 0;
        saveMockState("shikor_products", products);
      }
    } else {
      await db.collection("products").doc(id).update({ stock, inStock: stock > 0 });
    }
    showToast("Stock updated! ✅");
    loadPortalData();
  } catch (e) { console.error("Inventory update failed:", e); }
};

// ════════════════════════════════════════
// 7. COUPONS
// ════════════════════════════════════════
function renderCoupons() {
  const tbody = document.getElementById("admin-coupons-list");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (coupons.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px;">No coupons yet.</td></tr>`;
    return;
  }
  coupons.forEach(c => {
    const row = document.createElement("tr");
    const displayRule = c.type === "percentage" ? `${c.value}% Off` : `${c.value} ৳ Off`;
    const isActive = new Date(c.expiryDate) >= new Date() && c.status === "Active";
    row.innerHTML = `
      <td style="font-weight:700;font-size:1rem;">${c.code}</td>
      <td>${displayRule}</td>
      <td>${c.expiryDate}</td>
      <td><span class="badge ${isActive ? 'badge-delivered' : 'badge-cancelled'}">${isActive ? '✅ Active' : '⛔ Expired'}</span></td>
      <td><button onclick="deleteCoupon('${c.code}')" style="background:hsla(6,78%,57%,0.1);border:none;cursor:pointer;padding:6px 10px;border-radius:6px;font-size:0.85rem;color:#e74c3c;font-weight:700;">🗑️ Del</button></td>
    `;
    tbody.appendChild(row);
  });
}

async function handleSaveCoupon(event) {
  event.preventDefault();
  const code = document.getElementById("couponCode").value.trim().toUpperCase();
  const type = document.getElementById("couponType").value;
  const value = parseInt(document.getElementById("couponValue").value, 10);
  const expiryDate = document.getElementById("couponExpiry").value;
  const data = { code, type, value, expiryDate, status: "Active" };
  try {
    if (isMockMode) {
      const idx = coupons.findIndex(c => c.code === code);
      if (idx > -1) coupons[idx] = data;
      else coupons.push(data);
      saveMockState("shikor_coupons", coupons);
    } else {
      await db.collection("coupons").doc(code).set(data);
    }
    showToast("Coupon created! 🏷️");
    document.getElementById("adminCouponForm").reset();
    loadPortalData();
  } catch (e) { showToast("Failed to save coupon.", true); }
}

window.deleteCoupon = async function(code) {
  if (!confirm(`Delete coupon ${code}?`)) return;
  try {
    if (isMockMode) {
      coupons = coupons.filter(c => c.code !== code);
      saveMockState("shikor_coupons", coupons);
    } else {
      await db.collection("coupons").doc(code).delete();
    }
    showToast("Coupon deleted.");
    loadPortalData();
  } catch (e) { showToast("Failed to delete coupon.", true); }
};

// ════════════════════════════════════════
// 8. REPORTS
// ════════════════════════════════════════
function renderReports() {
  const catBody = document.getElementById("reports-category-revenue");
  const prodBody = document.getElementById("reports-product-revenue");
  if (!catBody || !prodBody) return;

  const catRev = {}, catOrd = {}, prodRev = {}, prodQty = {};
  categories.forEach(c => { catRev[c.id] = 0; catOrd[c.id] = 0; });
  products.forEach(p => { prodRev[p.id] = 0; prodQty[p.id] = 0; });

  orders.filter(o => o.status !== "Cancelled").forEach(o => {
    if (Array.isArray(o.items)) {
      o.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          const price = (item.discountPrice > 0 ? item.discountPrice : item.price) * item.quantity;
          catRev[prod.categoryId] = (catRev[prod.categoryId] || 0) + price;
          catOrd[prod.categoryId] = (catOrd[prod.categoryId] || 0) + 1;
          prodRev[item.productId] = (prodRev[item.productId] || 0) + price;
          prodQty[item.productId] = (prodQty[item.productId] || 0) + item.quantity;
        }
      });
    }
  });

  catBody.innerHTML = "";
  categories.forEach(cat => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="font-weight:700;">${cat.nameEn}</td>
      <td>${catOrd[cat.id] || 0}</td>
      <td style="font-weight:700;color:var(--green);">${(catRev[cat.id] || 0)} ৳</td>
    `;
    catBody.appendChild(row);
  });

  prodBody.innerHTML = "";
  const sortedProds = [...products].sort((a, b) => (prodRev[b.id] || 0) - (prodRev[a.id] || 0));
  sortedProds.slice(0, 5).forEach(p => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="font-weight:700;">${p.nameEn}</td>
      <td>${prodQty[p.id] || 0} ${p.unitEn || ""}s</td>
      <td style="font-weight:700;color:var(--green);">${prodRev[p.id] || 0} ৳</td>
    `;
    prodBody.appendChild(row);
  });
}

// ════════════════════════════════════════
// 9. SETTINGS
// ════════════════════════════════════════
function renderSettings() {
  const fields = ["setLogoUrl","setContactEmail","setContactPhone","setWhatsappNumber","setDeliveryChargeDhaka","setDeliveryChargeOutside"];
  const keys   = ["logoUrl","contactEmail","contactPhone","whatsappNumber","deliveryChargeDhaka","deliveryChargeOutside"];
  const defaults= ["logo.png","borhankustia@gmail.com","+8801998518914","8801998518914",60,120];
  fields.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.value = settings[keys[i]] !== undefined ? settings[keys[i]] : defaults[i];
  });
}

async function handleSaveSettings(event) {
  event.preventDefault();
  const btn = document.getElementById("btn-save-settings");
  if (btn) { btn.disabled = true; btn.innerHTML = `<span class="upload-spinner"></span> Saving...`; }
  try {
    const data = {
      logoUrl:               document.getElementById("setLogoUrl").value.trim(),
      contactEmail:          document.getElementById("setContactEmail").value.trim(),
      contactPhone:          document.getElementById("setContactPhone").value.trim(),
      whatsappNumber:        document.getElementById("setWhatsappNumber").value.trim(),
      deliveryChargeDhaka:   parseInt(document.getElementById("setDeliveryChargeDhaka").value, 10),
      deliveryChargeOutside: parseInt(document.getElementById("setDeliveryChargeOutside").value, 10),
      socialLinks: settings.socialLinks || { facebook: "#", instagram: "#" }
    };
    if (isMockMode) {
      settings = data;
      saveMockState("shikor_settings", settings);
      localStorage.setItem("shikor_shipping_dhaka", data.deliveryChargeDhaka);
      localStorage.setItem("shikor_shipping_outside", data.deliveryChargeOutside);
    } else {
      await db.collection("settings").doc("store_settings").set(data);
    }
    showToast("Settings saved! ⚙️");
    await loadPortalData();
  } catch (e) {
    console.error("Settings save error:", e);
    showToast("Failed to save settings: " + (e.message || ""), true);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = "💾 Save Settings"; }
  }
}
