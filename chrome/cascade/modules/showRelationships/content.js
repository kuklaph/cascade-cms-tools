function setAttributes(element, classes, attributes) {
  element.classList.add(...classes);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}
function createButton() {
  const btn = document.createElement("button");
  const icon = document.createElement("i");
  setAttributes(btn, ["btn-table", "btn-md"], {
    "data-layout": "thumb",
    "aria-label": "View Relationships",
    type: "button",
  });
  setAttributes(icon, ["ci", "ci-group", "button-icon"], {
    role: "img",
    "aria-hidden": true,
  });
  btn.appendChild(icon);
  return btn;
}
const btn = createButton();
const tableControls = document.querySelector(".table-controls-right");
tableControls.firstChild.before(btn);

btn.addEventListener("click", async (e) => {
  if (document.querySelector("#relationship")) {
    return;
  }
  btn.disabled = true;
  e.preventDefault();
  const folderInfo = await global_ITS_sendMessage({
    action: "generateFolderInfo",
    fromModule: "showRelationships",
    toModule: "showRelationships",
    data: {},
  });
  if (!folderInfo) {
    btn.disabled = false;
    return;
  }
  renderRelationships(folderInfo);
  btn.disabled = false;
});

function renderRelationships(assetInfo) {
  const renderValue = getRenderValue();
  let children = getFilteredChildren(
    assetInfo.asset.folder.children,
    renderValue
  );

  removeOldHeader();

  const relationshipHeader = createRelationshipHeader();
  const tableHeaderRow = document.querySelector("thead tr");
  tableHeaderRow.appendChild(relationshipHeader);

  children.forEach(async (child) => {
    const relationships = await global_ITS_sendMessage({
      action: "generateRelationships",
      fromModule: "showRelationships",
      toModule: "showRelationships",
      data: child,
    });
    const td = createRelationshipTd(relationships.subscribers.length);
    const childElement = document.querySelector(`#row-${child.id}`);
    childElement.appendChild(td);
    if (
      relationships.subscribers.length === 0 &&
      !childElement.querySelector(`td>a[data-asset-type="folder"]`)
    ) {
      childElement.style.backgroundColor = "#ff000029";
    }
  });

  return assetInfo;
}

function getRenderValue() {
  return document.querySelector(".dataTables_length .selectize-input .item")
    .innerText;
}

function getFilteredChildren(children, renderValue) {
  if (renderValue === "10") return children.slice(0, 10);
  if (renderValue === "20") return children.slice(0, 20);
  if (renderValue === "30") return children.slice(0, 30);
  return children;
}

function removeOldHeader() {
  const oldHeader = document.querySelector(".relationship_header");
  if (oldHeader) oldHeader.remove();
}

function createRelationshipHeader() {
  const relationshipHeader = document.createElement("th");
  setAttributes(relationshipHeader, ["relationship"], {
    style: "width:20%",
    tabindex: "0",
    "aria-controls": "DataTables_Table_0",
    rowspan: "1",
    colspan: "1",
    "aria-label": "Relationships: activate to sort column ascending",
  });
  relationshipHeader.classList.add("relationship_header");
  relationshipHeader.textContent = "Relationships";
  return relationshipHeader;
}

function createRelationshipTd(value) {
  const td = document.createElement("td");
  td.innerText = value;
  td.setAttribute("id", "relationship");
  return td;
}
