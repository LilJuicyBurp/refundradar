// RefundRadar Extension — content.js
// Extracts product name and price from the current page

(function () {
  "use strict";

  /**
   * Attempt to extract product info from the current page.
   * Covers Amazon, Best Buy, Target, Walmart, Apple, and generic OpenGraph/JSON-LD.
   */
  function getProductInfo() {
    const url = window.location.href;
    const hostname = window.location.hostname;

    let productName = null;
    let price = null;
    let originalPrice = null;

    // ── JSON-LD structured data (most reliable) ────────────────────────────
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent);
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (item["@type"] === "Product") {
            productName = productName || item.name;
            const offer = item.offers;
            if (offer) {
              const offerData = Array.isArray(offer) ? offer[0] : offer;
              price = price || String(offerData.price || "");
            }
          }
        }
      } catch {}
    }

    // ── OpenGraph fallback ─────────────────────────────────────────────────
    if (!productName) {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      productName = ogTitle?.content || null;
    }

    // ── Amazon ─────────────────────────────────────────────────────────────
    if (hostname.includes("amazon.com")) {
      productName =
        productName ||
        document.getElementById("productTitle")?.textContent?.trim() ||
        document.querySelector(".product-title-word-break")?.textContent?.trim();

      const priceWhole = document.querySelector(".a-price-whole")?.textContent?.replace(/[^0-9]/g, "");
      const priceFrac = document.querySelector(".a-price-fraction")?.textContent?.replace(/[^0-9]/g, "");
      if (priceWhole) {
        price = price || `${priceWhole}.${priceFrac || "00"}`;
      }

      const wasPriceEl = document.querySelector(".a-text-strike, .priceBlockStrikePriceString");
      originalPrice = wasPriceEl?.textContent?.replace(/[^0-9.]/g, "") || null;
    }

    // ── Best Buy ───────────────────────────────────────────────────────────
    if (hostname.includes("bestbuy.com")) {
      productName =
        productName ||
        document.querySelector(".sku-title h1")?.textContent?.trim() ||
        document.querySelector('[class*="heading-5"]')?.textContent?.trim();

      const priceEl = document.querySelector('[class*="priceView-customer-price"] span');
      price = price || priceEl?.textContent?.replace(/[^0-9.]/g, "") || null;
    }

    // ── Target ────────────────────────────────────────────────────────────
    if (hostname.includes("target.com")) {
      productName =
        productName ||
        document.querySelector('[data-test="product-title"]')?.textContent?.trim();

      const priceEl = document.querySelector('[data-test="product-price"]');
      price = price || priceEl?.textContent?.replace(/[^0-9.]/g, "") || null;
    }

    // ── Walmart ───────────────────────────────────────────────────────────
    if (hostname.includes("walmart.com")) {
      productName =
        productName ||
        document.querySelector('[itemprop="name"]')?.textContent?.trim() ||
        document.querySelector(".prod-ProductTitle")?.textContent?.trim();

      const priceEl = document.querySelector('[itemprop="price"]');
      price = price || priceEl?.getAttribute("content") || priceEl?.textContent?.replace(/[^0-9.]/g, "") || null;
    }

    // ── Generic fallback ──────────────────────────────────────────────────
    if (!productName) {
      productName =
        document.querySelector("h1")?.textContent?.trim() ||
        document.title?.split(" - ")[0]?.trim() ||
        "Unknown Product";
    }

    if (!price) {
      // Try to find any price-like element
      const priceEls = document.querySelectorAll(
        '[class*="price"],[class*="Price"],[id*="price"],[itemprop="price"]'
      );
      for (const el of priceEls) {
        const text = el.textContent?.trim();
        const match = text?.match(/\$(\d+(?:\.\d{1,2})?)/);
        if (match) {
          price = match[1];
          break;
        }
      }
    }

    return {
      productName: productName?.substring(0, 100) || "Unknown Product",
      price: price || null,
      originalPrice: originalPrice || null,
      url,
      hostname,
    };
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "getProductInfo") {
      sendResponse(getProductInfo());
    }
    return true;
  });
})();
