function run() {
  loadButton();
  loadEventListener();
}
var defaultLoaded = true;
var anchors = [];

function loadButton() {
  const menu = document.getElementById("menu-action");
  const listElement = `
    <li>
    <button
      type="button"
      id="its-verbose-anchor-links"
      class="btn-link btn-md">
      <i aria-hidden="true" role="img" class="ci ci-format button-icon"></i>
      <span data-cy="button-text" class="button-text">Anchors</span>
    </button>
    </li>
    `;

  menu.insertAdjacentHTML("afterbegin", listElement);
}

function loadEventListener() {
  const button = document.getElementById("its-verbose-anchor-links");
  button.addEventListener("click", showAnchors);
}

function showAnchors() {
  defaultLoaded = !defaultLoaded;
  const iframe = document.getElementById("asset-render");
  const iframeDocument =
    iframe.contentDocument || iframe.contentWindow.document;
  const findAnchors = [
    ...iframeDocument.querySelectorAll(".container > .row a"),
  ].filter((f) => f.parentNode.classList[0] !== "breadcrumb-item");
  if (!anchors.length) {
    anchors = findAnchors.map((a) => a.cloneNode(true));
  }

  findAnchors.forEach((anchor, i) => {
    const parent = anchor.parentElement;
    if (defaultLoaded) {
      parent.replaceChild(anchors[i].cloneNode(true), anchor);
    } else {
      anchor.textContent = `${anchor.textContent} ${anchor.href}`;
    }
  });
}

run();
