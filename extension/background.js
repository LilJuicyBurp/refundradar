// RefundRadar Extension — background.js (Service Worker)
// Handles background tasks: badge updates, alarm-based checks, notification dispatch

const API_BASE = "http://localhost:5000"; // Update to production URL

// ─── On Install ───────────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  console.log("[RefundRadar] Extension installed.");

  // Set up periodic alarm (every 6 hours)
  chrome.alarms.create("checkAlerts", { periodInMinutes: 360 });

  // Initialize storage defaults
  chrome.storage.local.set({
    alertCount: 0,
    lastChecked: null,
    purchases: [],
    trackedPrices: [],
  });
});

// ─── Alarm handler ────────────────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "checkAlerts") {
    await checkForAlerts();
  }
});

// ─── Check for new alerts from the server ────────────────────────────────────
async function checkForAlerts() {
  try {
    const res = await fetch(`${API_BASE}/api/alerts?userId=1`);
    if (!res.ok) return;

    const alerts = await res.json();
    const unreadCount = alerts.filter((a) => !a.isRead).length;

    // Update badge
    chrome.action.setBadgeText({ text: unreadCount > 0 ? String(unreadCount) : "" });
    chrome.action.setBadgeBackgroundColor({ color: "#1f7a57" });

    // Store count for popup
    chrome.storage.local.set({ alertCount: unreadCount, lastChecked: Date.now() });

    // Send notification for urgent alerts
    const urgent = alerts.filter(
      (a) => !a.isRead && a.type === "return_window"
    );
    for (const alert of urgent.slice(0, 2)) {
      sendNotification(alert);
    }
  } catch (err) {
    // Server may not be running — fail silently
    console.debug("[RefundRadar] Could not reach server:", err.message);
  }
}

// ─── Send a browser notification ─────────────────────────────────────────────
function sendNotification(alert) {
  const iconMap = {
    return_window: "⏰",
    price_drop: "💰",
    warranty: "🛡️",
    refund_opportunity: "↩️",
  };

  chrome.notifications.create(`alert-${alert.id}`, {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: `RefundRadar: ${alert.title}`,
    message: alert.message,
    priority: 2,
  });
}

// ─── Handle notification click ────────────────────────────────────────────────
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.tabs.create({ url: `${API_BASE}/#/alerts` });
  chrome.notifications.clear(notificationId);
});

// ─── Handle messages from popup or content scripts ───────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "getAlertCount") {
    chrome.storage.local.get(["alertCount"], (result) => {
      sendResponse({ count: result.alertCount ?? 0 });
    });
    return true;
  }

  if (message.action === "refreshAlerts") {
    checkForAlerts().then(() => sendResponse({ ok: true }));
    return true;
  }
});
