var special = false;

async function run() {
  await global_ITS_asyncInterval(global_ITS_isCascadeLoading);

  const observer = new MutationObserver(() => {
    const input = document.getElementById("name");
    if (input) {
      input.addEventListener("keydown", checkKey);
      input.addEventListener("paste", handlePaste);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function checkKey(event) {
  if (event.key === "Shift") {
    special = true;
  }
}

function toKebabCase(str) {
  return str
    .toLowerCase()
    .replaceAll("&", "")
    .replaceAll("and", "")
    .replaceAll("of", "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .trim();
}

async function handlePaste(event) {
  try {
    event.preventDefault();
    let text = await navigator.clipboard.readText();
    let pasteText = toKebabCase(text);
    if (special) {
      pasteText = text;
      special = false;
    }
    const selection = window.getSelection();
    if (!selection) {
      event.target.value = pasteText;
    } else {
      event.target.value = event.target.value.replace(selection, pasteText);
    }
    event.target.focus();
  } catch (error) {
    global_ITS_showAlert({ fromModule: "kebabOnPaste", data: err });
  }
}

// run();
