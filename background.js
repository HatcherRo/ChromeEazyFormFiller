chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      chrome.tabs.executeScript(tabId, { file: 'content.js' });
      console.log('content.js executed');
    }
  });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "download") {
    var data = request.data;
    var json = JSON.stringify(data);
    var blob = new Blob([json], {type: 'application/json'});
    var url = URL.createObjectURL(blob);
    chrome.downloads.download({url: url, filename: 'data.json'});
    console.log("DOWNLOADING RUNTIME", data);
  }
});