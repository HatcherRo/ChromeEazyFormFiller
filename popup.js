document.getElementById('exportButton').addEventListener('click', function () {
    console.log('exportButton clicked');
});

document.getElementById('importButton').addEventListener('click', function () {
    console.log('importButton clicked');
});

document.addEventListener('DOMContentLoaded', function () {
    var getFormsButton = document.getElementById('getforms');
    getFormsButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "fetchForms" }, function (response) {
                const forms = response.forms;
                if (!forms || !forms.length) {
                    console.log('No forms found');
                    return;
                }
                const formsList = document.getElementById('formsList');
                formsList.innerHTML = '';
                let formCount = 0;
                forms.forEach(form => {
                    const formName = form.id || form.name || 'unnamed_form_' + formCount;
                    const formDiv = document.createElement('div');
                    const button = document.createElement('button');
                    button.textContent = formName; // Set the button text to formName
                    button.onclick = function () {
                        formDiv.innerHTML = ''
                        const formElements = form.elements;
                        formElements.forEach((element, index) => {
                            if (element.type !== "button" && element.type !== "submit") {
                                let fieldContainer = document.createElement("div");
                                let fieldLabel = document.createElement("label");
                                fieldLabel.textContent = `${element.name.length
                                    ? element.name
                                    : element.id.length
                                        ? element.id
                                        : element.placeholder.length
                                            ? element.placeholder
                                            : element.index
                                    }: `;
                                let fieldValue = document.createElement("input");
                                fieldValue.type = element.type ? element.type : "text";
                                fieldValue.value = element.value;
                                fieldValue.id = `input-${form.index}-${index}`;
                                fieldContainer.appendChild(fieldLabel);
                                fieldContainer.appendChild(fieldValue);
                                formDiv.appendChild(fieldContainer);
                            }
                        });
                        const saveButton = document.createElement('button');
                        saveButton.textContent = 'Save';
                        saveButton.addEventListener("click", function (event) {
                            saveButtonClicked(form);
                        });
                        //add the save button to the formDiv
                        formDiv.appendChild(saveButton);
                    };

                    // Append the button to formDiv
                    formDiv.appendChild(button);
                    formsList.appendChild(formDiv);
                    formCount++;
                });
            });
        });
    }, false);
});


function saveButtonClicked(form) {
    let formData = form.elements.map((element, index) => {
        if (element.type !== "button" && element.type !== "submit") {
            let inputValue = document.getElementById(
                `input-${form.index}-${index}`
            ).value;
            return {
                id: element.id,
                name: element.name,
                value: inputValue,
            };
        }
    });
    const formName = form.id || form.name || 'unnamed_form_' + formCount;
    createJSONFromForm(formData, formName);
}

function createJSONFromForm(formData, formName) {
    let jsonData = {};
    formData.forEach(item => {
        if (!item) {
            return;
        }
        jsonData[item.name] = item.value;
    });

    saveJSON(jsonData, formName);
}
function saveJSON(jsonData, formName) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentTab = tabs[0]; // there will be only one in this array
        const currentUrl = currentTab.url;
        // Assuming you want to save jsonData under a specific key, e.g., 'formData'
        chrome.storage.local.get(["EasyFormFiller"], function (result) {
            console.log("Storage data: ", result);
            // Initialize EasyFormFiller object if it doesn't exist
            let storageData = result["EasyFormFiller"] ? result["EasyFormFiller"] : {};
            
            // Check if currentUrl exists, if not initialize it
            if (!storageData[currentUrl]) {
                storageData[currentUrl] = {};
            }
            
            // Update or add the new form data for the currentUrl
            storageData[currentUrl][formName] = [{ formData: jsonData }];
            
            // Save the updated storageData back to chrome.storage.local
            chrome.storage.local.set({ "EasyFormFiller": storageData }, function () {
                console.log("Form data saved: ", storageData);
            });
        });
    });
}