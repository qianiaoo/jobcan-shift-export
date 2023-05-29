// popup.js
document.getElementById('downloadButton').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "downloadSchedule"});
    });
});
