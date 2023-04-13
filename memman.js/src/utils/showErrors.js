function showError(errorMessage) {
    const modalContainer = document.createElement("div");
    modalContainer.style.position = "fixed";
    modalContainer.style.top = "0";
    modalContainer.style.left = "0";
    modalContainer.style.width = "100%";
    modalContainer.style.height = "100%";
    modalContainer.style.display = "flex";
    modalContainer.style.justifyContent = "center";
    modalContainer.style.alignItems = "center";
    modalContainer.style.background = "rgba(0,0,0,0.5)";
    modalContainer.style.zIndex = "999";

    const errorBox = document.createElement("div");
    errorBox.style.width = "80%";
    errorBox.style.maxWidth = "500px";
    errorBox.style.background = "#fff";
    errorBox.style.borderRadius = "4px";
    errorBox.style.padding = "20px";

    const closeButton = document.createElement("button");
    closeButton.innerHTML = "X";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.borderRadius = "50%";
    closeButton.style.width = "25px";
    closeButton.style.height = "25px";
    closeButton.style.border = "none";
    closeButton.style.background = "#f00";
    closeButton.style.color = "#fff";
    closeButton.style.fontWeight = "bold";
    closeButton.addEventListener("click", () => {
        modalContainer.remove();
    });

    const errorMessageNode = document.createTextNode(errorMessage);

    errorBox.appendChild(closeButton);
    errorBox.appendChild(errorMessageNode);
    modalContainer.appendChild(errorBox);

    document.body.appendChild(modalContainer);
}

export { showError}