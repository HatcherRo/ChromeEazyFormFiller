if (typeof forms === 'undefined') {
    var forms = Array.from(document.forms).map((form, index) => {
        return {
          id: form.id,
          class: form.className,
          name: form.name,
          action: form.action,
          method: form.method,
          elements: Array.from(form.elements).map(element => {
            return {
              id: element.id,
              name: element.name,
              type: element.type,
              value: element.value
            };
          })
        };
      });
  
  chrome.runtime.sendMessage({forms: forms});
}

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getForms') {
        let tabForms = Array.from(document.forms).map((form, index) => {
            return {
                index: index,
                id: form.id ? form.id : '',
                name: form.name ? form.name : '',
                elements: Array.from(form.elements).map((element, index) => {
                    return {
                        index: index,
                        id: element.id ? element.id : '',
                        name: element.name ? element.name : '',
                        type: element.type ? element.type : '',
                        value: element.value ? element.value : '',
                        class: element.className ? element.className : '',
                        placeholder: element.placeholder ? element.placeholder : ''
                    };
                })
            };
        });
        sendResponse({tabForms: tabForms});
    }
});


// This function adds a prefill button above each form on the page
function addPrefillButtons() {
    let forms = document.getElementsByTagName('form');
    for (let i = 0; i < forms.length; i++) {
        // Check if there is saved data for the form
        chrome.storage.local.get([window.location.href], function(result) {
            if (result[window.location.href][i]) {
                let prefillButton = document.createElement('button');
                prefillButton.textContent = 'Prefill Form';
                prefillButton.addEventListener('click', function() {
                    prefillForm(forms[i], i);
                });
                forms[i].parentNode.insertBefore(prefillButton, forms[i]);
            }
        });
    }
}

// This function prefills a form with saved data
function prefillForm(form, formIndex) {
    chrome.storage.local.get([window.location.href], function(result) {
        let urlData = result[window.location.href];
        if (urlData && urlData[formIndex]) {
            let formData = urlData[formIndex];
            for (let i = 0; i < formData.length; i++) {
                let elementData = formData[i];
                let element = form.elements[i];
                if (element && elementData) {
                    element.value = elementData.value;
                }
            }
        }
    });
}

// Add prefill buttons when the page loads
window.addEventListener('load', addPrefillButtons);