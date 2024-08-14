chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "fetchForms") {
        const forms = document.querySelectorAll('form');
        const formsData = Array.from(forms).map(form => {
            return {
                action: form.action,
                method: form.method,
                id: form.id || null,
                name: form.name || null,
                elements: Array.from(form.elements).map(element => ({
                    tagName: element.tagName,
                    name: element.name,
                    type: element.type,
                    value: element.value
                }))
            };
        });

        sendResponse({forms: formsData});
        return true;
    }
});