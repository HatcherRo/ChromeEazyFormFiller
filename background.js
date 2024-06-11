chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      chrome.tabs.executeScript(tabId, { file: 'content.js' });
      console.log('content.js executed');
    }
  });

  // background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request.forms);
    //loop over all the forms and find any named "uxpLoginForm"
    let loginForm = request.forms.find(form => form.name === 'uxpLoginForm');
    console.log(loginForm); 
});