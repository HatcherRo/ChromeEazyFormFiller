chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getCurrentTabUrl") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var currentTab = tabs[0];
            if (currentTab) { // Check if the tab is found
                sendResponse({url: currentTab.url});
            }
        });
        return true;
    }
});