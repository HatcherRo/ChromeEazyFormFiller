document.getElementById('exportButton').addEventListener('click', async function () {
    try {
        const data = await getExportData(); 
        const jsonString = JSON.stringify(data);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = url;
        downloadAnchor.download = 'exportedData.json'; // Specify the file name for the download
        document.body.appendChild(downloadAnchor); // Append the anchor to the document
        downloadAnchor.click(); // Programmatically click the anchor to trigger the download

        document.body.removeChild(downloadAnchor); // Remove the anchor from the document
        URL.revokeObjectURL(url); // Revoke the Blob URL

    } catch (error) {
        console.error("Failed to get export data:", error);
    }
});

document.getElementById('importButton').addEventListener('click', function () {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '';
    if (!document.getElementById('jsonInput')) {
        const textarea = document.createElement('textarea');
        textarea.id = 'jsonInput';
        textarea.rows = 10;
        textarea.cols = 50;
        textarea.placeholder = 'Paste JSON here...';
        contentDiv.appendChild(textarea);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save JSON'; // Step 2: Set button text

        contentDiv.appendChild(saveButton);

        saveButton.addEventListener('click', function () {
            const jsonText = textarea.value;
            try {
                const jsonData = JSON.parse(jsonText);
                chrome.storage.local.set({ "EasyFormFiller": jsonData }, function () {
                    console.log("Form data saved: ", storageData);
                });
                contentDiv.innerHTML = '';
                alert('Import complete.');
            } catch (error) {
                alert('Invalid JSON');
            }
        });

        textarea.focus();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var getFormsButton = document.getElementById('getforms');
    const contentDiv = document.getElementById('content');
    getFormsButton.addEventListener('click', function () {
        contentDiv.innerHTML = '';
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "fetchForms" }, function (response) {
                const forms = response.forms;
                if (!forms || !forms.length) {
                    console.log('No forms found');
                    return;
                }
                const formsList = document.createElement('div');
                formsList.id = 'formsList';
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
                            contentDiv.innerHTML = '';
                            alert('Save complete.');

                        });
                        //add the save button to the formDiv
                        formDiv.appendChild(saveButton);
                    };

                    // Append the button to formDiv
                    formDiv.appendChild(button);
                    formsList.appendChild(formDiv);
                    contentDiv.appendChild(formsList);
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


function getExportData() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["EasyFormFiller"], function (result) {
            let storageData = result["EasyFormFiller"] ? result["EasyFormFiller"] : {};
            resolve(storageData); // Step 2: Resolve the Promise with the data
        });
    });
}

