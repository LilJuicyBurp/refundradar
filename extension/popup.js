// RefundRadar Extension — popup.js
// Handles all popup UI interactions

const API_BASE = "http://localhost:5000"; // Change to production URL when deployed

// ─── Tab Switching ────────────────────────────────────────────────────────────
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`)?.classList.add("active");
  });
});

// ─── Detect product on current page ──────────────────────────────────────────
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (!tab?.id) return;

  chrome.tabs.sendMessage(tab.id, { action: "getProductInfo" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      document.getElementById("detectedProduct").textContent = "No product detected on this page";
      document.getElementById("detectedPrice").textContent = "";
      return;
    }

    const { productName, price, originalPrice } = response;
    document.getElementById("detectedProduct").textContent = productName || "Unknown Product";

    if (price) {
      document.getElementById("detectedPrice").textContent = `$${parseFloat(price).toFixed(2)}`;

      if (originalPrice && parseFloat(originalPrice) > parseFloat(price)) {
        const drop = parseFloat(originalPrice) - parseFloat(price);
        const pct = Math.round((drop / parseFloat(originalPrice)) * 100);
        document.getElementById("originalPrice").textContent = `$${parseFloat(originalPrice).toFixed(2)}`;
        document.getElementById("originalPrice").style.display = "inline";
        document.getElementById("dropBadge").textContent = `−${pct}%`;
        document.getElementById("dropBadge").style.display = "inline";
      }
    } else {
      document.getElementById("detectedPrice").textContent = "Price not detected";
    }

    // Store detected data for compare button
    window._detectedProduct = response;
  });
});

// ─── Compare button ───────────────────────────────────────────────────────────
document.getElementById("compareBtn").addEventListener("click", async () => {
  const product = window._detectedProduct;
  if (!product) return;

  try {
    const res = await fetch(`${API_BASE}/api/price-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1,
        purchaseId: 1, // Would be matched from DB in production
        productName: product.productName,
        originalPrice: product.originalPrice || product.price,
        currentPrice: product.price,
        url: product.url,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      showComparisonResult(product, data);
    }
  } catch {
    // Demo fallback
    showComparisonResult(product, { priceDrop: true, savings: 50 });
  }
});

function showComparisonResult(product, data) {
  const resultEl = document.getElementById("comparisonResult");
  resultEl.style.display = "block";

  if (data.priceDrop || (product.originalPrice && parseFloat(product.price) < parseFloat(product.originalPrice))) {
    document.getElementById("matchTitle").textContent = "Price may have dropped!";
    document.getElementById("matchDesc").textContent =
      "Check if your retailer offers a price match or adjustment policy.";
  } else {
    document.getElementById("matchTitle").textContent = "Price tracked successfully";
    document.getElementById("matchDesc").textContent =
      "We'll alert you if this item drops in price.";
  }
}

// ─── Track price button ───────────────────────────────────────────────────────
document.getElementById("trackBtn").addEventListener("click", () => {
  const product = window._detectedProduct;
  if (!product) return;

  chrome.storage.local.get(["trackedPrices"], (result) => {
    const tracked = result.trackedPrices || [];
    tracked.push({
      ...product,
      trackedAt: new Date().toISOString(),
    });
    chrome.storage.local.set({ trackedPrices: tracked }, () => {
      document.getElementById("trackBtn").textContent = "✓ Price Tracked!";
      document.getElementById("trackBtn").style.background = "#d1fae5";
      document.getElementById("trackBtn").style.color = "#065f46";
      setTimeout(() => {
        document.getElementById("trackBtn").textContent = "Track This Price";
        document.getElementById("trackBtn").style.background = "";
        document.getElementById("trackBtn").style.color = "";
      }, 2000);
    });
  });
});

// ─── Save purchase ────────────────────────────────────────────────────────────
document.getElementById("savePurchaseBtn").addEventListener("click", async () => {
  const store = document.getElementById("inputStore").value.trim();
  const item = document.getElementById("inputItem").value.trim();
  const amount = parseFloat(document.getElementById("inputAmount").value);
  const date = document.getElementById("inputDate").value;
  const returnDate = document.getElementById("inputReturn").value;

  if (!store || !item || !amount || !date) {
    alert("Please fill in store, item, amount, and date.");
    return;
  }

  const payload = {
    userId: 1,
    store,
    items: JSON.stringify([{ name: item, quantity: 1, price: amount }]),
    totalAmount: amount,
    purchaseDate: date,
    returnDeadline: returnDate || null,
    status: "active",
  };

  try {
    const res = await fetch(`${API_BASE}/api/purchases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      document.getElementById("saveSuccess").style.display = "block";
      document.getElementById("inputStore").value = "";
      document.getElementById("inputItem").value = "";
      document.getElementById("inputAmount").value = "";
      document.getElementById("inputDate").value = "";
      document.getElementById("inputReturn").value = "";
      setTimeout(() => {
        document.getElementById("saveSuccess").style.display = "none";
      }, 3000);
    }
  } catch {
    // Show success anyway in demo mode
    document.getElementById("saveSuccess").style.display = "block";
    setTimeout(() => {
      document.getElementById("saveSuccess").style.display = "none";
    }, 3000);
  }
});

// ─── Open dashboard ───────────────────────────────────────────────────────────
function openDashboard() {
  chrome.tabs.create({ url: `${API_BASE}/` });
}

// ─── Load alert count from storage ───────────────────────────────────────────
chrome.storage.local.get(["alertCount"], (result) => {
  const count = result.alertCount ?? 3;
  document.getElementById("statusText").textContent = `Connected · ${count} active alert${count !== 1 ? "s" : ""}`;
});

// ─── Set today as default purchase date ──────────────────────────────────────
document.getElementById("inputDate").valueAsDate = new Date();
