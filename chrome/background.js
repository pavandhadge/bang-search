chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});

window.bangs = {}; // Store bangs globally

function loadbangs() {
  chrome.storage.sync.get(["bangs"], (data) => {
    if (chrome.runtime.lastError) {
      console.error("Error loading bangs:", chrome.runtime.lastError);
      return;
    }

    if (data && data.bangs && Object.keys(data.bangs).length > 0) {
      // ✅ Convert stored object to Map
      window.bangs = new Map(Object.entries(data.bangs));
      console.log("current bangs : ", window.bangs);
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

loadbangs();

// Handle omnibox input
chrome.omnibox.onInputEntered.addListener((input) => {
  const words = input.trim().split(/\s+/);

  let bangCommand = null;
  let searchQueryWords = [...words]; // Clone to modify safely

  // Check first and last words for bang
  if (words[0].startsWith("!") && window.bangs[words[0].slice(1)]) {
    bangCommand = words[0].slice(1);
    console.log("this is the bang : ", bangCommand);
    searchQueryWords.shift();
  } else if (
    words.length > 1 &&
    words[words.length - 1].startsWith("!") &&
    window.bangs[words[words.length - 1].slice(1)]
  ) {
    bangCommand = words[words.length - 1].slice(1);
    searchQueryWords.pop();
  }

  const searchQuery = searchQueryWords.join(" ");

  if (bangCommand) {
    let targetURL = window.bangs[bangCommand] + encodeURIComponent(searchQuery);
    chrome.tabs.create({ url: targetURL }); // Open in a new tab
  } else {
    chrome.search.query({ disposition: "NEW_TAB", text: input });
  }
});
