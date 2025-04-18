function getForms(currentUrl, response) {
  let formsList = document.getElementById("formsList");
  formsList.innerHTML = "";
  response.tabForms.forEach((form, index) => {
    let formButton = document.createElement("button");
    formButton.textContent = `${
      form.id.length ? form.id : form.name.length ? form.name : form.index
    }`;
    formButton.addEventListener("click", function () {
      // Create a new fieldsContainer div
      let fieldsContainer = document.createElement("div");

      // Clear out all previous forms
      formsList.innerHTML = "";

      form.elements.forEach((element, index) => {
        if (element.type !== "button" && element.type !== "submit") {
          let fieldContainer = document.createElement("div");
          let fieldLabel = document.createElement("label");
          fieldLabel.textContent = `${
            element.name.length
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
          fieldValue.id = `input-${form.index}-${element.index}`;
          fieldContainer.appendChild(fieldLabel);
          fieldContainer.appendChild(fieldValue);
          fieldsContainer.appendChild(fieldContainer);
        }
      });
      let saveButton = document.createElement("button");
      saveButton.textContent = "Save";
      saveButton.addEventListener("click", function () {
        let formData = form.elements.map((element, index) => {
          if (element.type !== "button" && element.type !== "submit") {
            let inputValue = document.getElementById(
              `input-${form.index}-${element.index}`
            ).value;
            return {
              id: element.id,
              name: element.name,
              value: inputValue,
            };
          }
        });
        chrome.storage.local.get(["EasyFormFiller"][currentUrl], function (result) {
          let urlData = result[currentUrl] ? result[currentUrl] : {};
          urlData[form.index] = formData;
          let saveData = {};
          saveData["EasyFormFiller"] = saveData["EasyFormFiller"] ? saveData["EasyFormFiller"] : {};
          saveData["EasyFormFiller"][currentUrl] = urlData;
          chrome.storage.local.set(saveData, function () {
            console.log("Form data saved.");
          });
        });
      });
      fieldsContainer.appendChild(saveButton);
      formsList.appendChild(fieldsContainer);
    });
    formsList.appendChild(formButton);
  });
}
