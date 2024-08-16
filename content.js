chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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

        sendResponse({ forms: formsData });
        return true;
    }
});

function addPrefillButtons() {
    const forms = document.querySelectorAll('form');
    let formCount = 0;
    forms.forEach(form => {
        const formName = form.id || form.name || 'unnamed_form_' + formCount;
        chrome.runtime.sendMessage({ action: "getCurrentTabUrl" }, function (response) {
            const currentUrl = response.url;
            chrome.storage.local.get(["EasyFormFiller"], function (result) {
                let storageData = result["EasyFormFiller"] ? result["EasyFormFiller"] : {};
                if (storageData[currentUrl] && storageData[currentUrl][formName]) {
                    const formData = storageData[currentUrl][formName][0]["formData"];
                    addPrefillButton(currentUrl, form, formData);
                } else {
                    console.log("No saved data found for this form.");
                }
            });
        });
        formCount++;
    });
}

function addPrefillButton(currentUrl, form, formData) {
    const button = document.createElement('button');
    button.setAttribute('type', 'button'); // This prevents the form from being submitted when the button is clicked
    button.textContent = 'Prefill Form';
    button.style.padding = '0.375rem 0.75rem'; // Bootstrap padding
    button.style.fontSize = '1rem'; // Bootstrap font size
    button.style.lineHeight = '1.5'; // Bootstrap line height
    button.style.borderRadius = '0.25rem'; // Bootstrap border radius
    button.style.color = '#fff'; // Bootstrap button text color (white)
    button.style.cursor = 'pointer'; // Cursor pointer
    button.style.backgroundColor = '#6c757d'; // Grey background
    button.style.border = '2px solid #007bff'; // Blue border

    button.onclick = function () {
        const formElements = form.elements;
        for (const element of formElements) {
            const elementName = element.name; // Directly use the name property
            if (formData[elementName]) {
                const value = formData[elementName];
                // Check if the element is a checkbox or radio button
                if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = element.value === value;
                } else {
                    element.value = value;
                }
            }
        }
    }
    form.appendChild(button);
}

addPrefillButtons();


