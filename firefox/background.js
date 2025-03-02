chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});
function loadbangs() {
  chrome.storage.sync.get(["bangs"], (data) => {
    if (chrome.runtime.lastError) {
      console.error("Error loading bangs:", chrome.runtime.lastError);
      return;
    }

    if (data && data.bangs && Object.keys(data.bangs).length > 0) {
      // ✅ Convert stored object to Map
      window.bangs = new Map(Object.entries(data.bangs));
    } else {
      // ✅ Prevent infinite recursion
      let defaultBangs = window.Defaultbangs || new Map();
      let defaultBangsObj = Object.fromEntries(defaultBangs); // Convert Map to object

      chrome.storage.sync.set({ bangs: defaultBangsObj }, () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error saving default bangs:",
            chrome.runtime.lastError,
          );
        } else {
          console.log("Default bangs initialized.");
          // ✅ Call loadbangs() again only after saving is complete
          loadbangs();
        }
      });
    }
  });
}

// ✅ Call `loadbangs()` only once on startup
loadbangs();

chrome.webNavigation.onCommitted.addListener((details) => {
  if (["typed", "generated"].includes(details.transitionType)) {
    let url = new URL(details.url);

    if (
      (url.hostname.includes("google.com") && url.searchParams.has("q")) ||
      (url.hostname.includes("bing.com") && url.searchParams.has("q")) ||
      (url.hostname.includes("duckduckgo.com") && url.searchParams.has("q")) ||
      (url.hostname.includes("yahoo.com") && url.searchParams.has("p"))
    ) {
      let queryParam = url.searchParams.has("q") ? "q" : "p";
      let searchQuery = url.searchParams.get(queryParam).trim();

      let words = searchQuery.split(" ").filter(Boolean);
      if (words.length === 0) return;

      let targetURL = null;

      let firstWord = words[0];
      let lastWord = words[words.length - 1];

      // ✅ Ensure `window.bangs` is loaded before accessing
      if (window.bangs instanceof Map) {
        if (firstWord.startsWith("!") && window.bangs.has(firstWord.slice(1))) {
          targetURL =
            window.bangs.get(firstWord.slice(1)) +
            encodeURIComponent(words.slice(1).join(" "));
        } else if (
          lastWord.startsWith("!") &&
          window.bangs.has(lastWord.slice(1))
        ) {
          targetURL =
            window.bangs.get(lastWord.slice(1)) +
            encodeURIComponent(words.slice(0, -1).join(" "));
        }
      }

      if (targetURL) {
        chrome.tabs.update(details.tabId, { url: targetURL });
      }
    }
  }
});
