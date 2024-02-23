function createToast(message) {
  const toastExists = document.getElementById("its-assistant-window-alert");
  let toast;
  if (!toastExists) {
    toast = document.createElement("div");
    toast.id = "its-assistant-window-alert";
    document.body.appendChild(toast);
  } else {
    toast = toastExists;
  }
  toast.textContent = message;
  showToast(toast);
}

function showToast(toast) {
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
