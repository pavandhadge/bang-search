// Load bangs from storage
function loadBangs() {
  chrome.storage.sync.get(["bangs"], (data) => {
    let bangs = new Map(Object.entries(data.bangs || {}));
    window.bangs = bangs;

    let table = document.getElementById("bangsTable");

    // Clear existing rows (except header)
    table.innerHTML = `
      <tr>
        <th>Bang Key</th>
        <th>URL</th>
        <th>Actions</th>
      </tr>
    `;

    // Populate the table
    bangs.forEach((url, key) => {
      addBangRow(key, url);
    });
  });
}

// Save a bang
function savebang() {
  const bangKey = document.getElementById("bangkey").value.trim();
  const bangValue = document.getElementById("bangvalue").value.trim();

  if (!bangKey || !bangValue) {
    console.log("Bang key or value cannot be empty!");
    return;
  }

  chrome.storage.sync.get(["bangs"], (data) => {
    if (chrome.runtime.lastError) {
      console.error("Error loading bangs:", chrome.runtime.lastError);
      return;
    }

    let bangs = data.bangs || {};
    bangs[bangKey] = bangValue;

    chrome.storage.sync.set({ bangs }, () => {
      console.log(`Saved Bang: ${bangKey} → ${bangValue}`);
      loadBangs(); // Refresh UI
    });
  });
}

// Function to add a row to the table
function addBangRow(key, url) {
  let table = document.getElementById("bangsTable");
  let row = table.insertRow(-1);

  let keyCell = row.insertCell(0);
  let urlCell = row.insertCell(1);
  let actionCell = row.insertCell(2);

  keyCell.textContent = key;
  urlCell.textContent = url;

  let deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteBang(key));

  actionCell.appendChild(deleteButton);
}

// Function to delete a bang
function deleteBang(key) {
  chrome.storage.sync.get(["bangs"], (data) => {
    let bangs = data.bangs || {};

    if (bangs[key]) {
      delete bangs[key];

      chrome.storage.sync.set({ bangs }, () => {
        console.log(`Deleted Bang: ${key}`);
        loadBangs(); // Refresh UI
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadBangs();
  document.getElementById("saveBang").addEventListener("click", savebang);
});
