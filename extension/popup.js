document.getElementById("open").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://arizonanotaryprep.com/admin/operations/" });
});
