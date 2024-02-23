async function run() {
  const { href } = window.location;
  if (
    href.includes("action=edit") ||
    href.includes("action=copy") ||
    href.includes("action=delete")
  ) {
    checkListButton();
  }
  await global_ITS_sleep({ s: 1 });
  await global_ITS_asyncInterval(global_ITS_isCascadeLoading);
  const editButton = document.getElementById("edit-link");
  await global_ITS_asyncInterval(
    () => {
      if (editButton) {
        editButton.addEventListener("click", checkListButton);
        return true;
      }
    },
    200,
    100
  );
}

async function checkListButton() {
  await global_ITS_sleep({ s: 1 });
  await global_ITS_asyncInterval(global_ITS_isCascadeLoading);
  const dropdownClick = document.querySelector("#submit-advanced > button");
  if (dropdownClick) {
    dropdownClick.addEventListener("click", changeWorkflow);
    const hasResume = document.getElementById("draft-overwrite-resume");
    if (hasResume) {
      hasResume.addEventListener("click", resumeDraftNeedsToLoad);
    }
  }
}

async function resumeDraftNeedsToLoad() {
  await global_ITS_sleep({ s: 1 });
  await global_ITS_asyncInterval(global_ITS_isCascadeLoading);
  checkListButton();
}

function hasDraftSave() {
  const text = document.querySelector(".draft-autosave-status.muted");
  if (text.innerText === "Draft saved") {
    return true;
  }
  return false;
}

async function changeWorkflow() {
  const checkboxes = document.querySelectorAll(".doWorkflow.no-warn");
  const checkbox = checkboxes[checkboxes.length - 1];
  await global_ITS_asyncInterval(hasDraftSave);
  // Check the current state and toggle
  if (checkbox.checked) {
    // If checked, uncheck it
    checkbox.checked = false;
    checkbox.removeAttribute("checked");
  }
  const event = new Event("change", {
    bubbles: true,
    cancelable: true,
  });
  checkbox.dispatchEvent(event);
}

// run();
