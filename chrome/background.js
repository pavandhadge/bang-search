chrome.omnibox.onInputEntered.addListener((input) => {
  chrome.runtime.getBackgroundPage((backgroundPage) => {
    if (!backgroundPage || !backgroundPage.bangs) return;

    let bangs = backgroundPage.bangs;
    const words = input.trim().split(/\s+/); // Split by spaces

    let bangCommand = null;
    let searchQueryWords = [...words]; // Clone array to modify safely

    // Check if the first word is a bang
    if (words[0].startsWith("!") && bangs.has(words[0].slice(1))) {
      bangCommand = words[0].slice(1);
      searchQueryWords.shift(); // Remove the first word
    }
    // Check if the last word is a bang
    else if (
      words.length > 1 &&
      words[words.length - 1].startsWith("!") &&
      bangs.has(words[words.length - 1].slice(1))
    ) {
      bangCommand = words[words.length - 1].slice(1);
      searchQueryWords.pop(); // Remove the last word
    }

    const searchQuery = searchQueryWords.join(" ");

    let targetURL;
    if (bangCommand) {
      targetURL = bangs.get(bangCommand) + encodeURIComponent(searchQuery);
      chrome.tabs.create({ url: targetURL }); // FIX: Use tabs.create instead of tabs.update
    } else {
      chrome.search.query({ disposition: "NEW_TAB", text: input });
    }
  });
});
