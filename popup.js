document.getElementById('getforms').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let currentUrl = tabs[0].url;
        chrome.tabs.sendMessage(tabs[0].id, {action: "getForms"}, function(response) {
            getForms(currentUrl, response);
        });
    });
});

document.getElementById('exportButton').addEventListener('click', function() {
    chrome.storage.local.get("EasyFormFiller", function(result) {
        chrome.runtime.sendMessage({action: "download", data: result});
      });
});