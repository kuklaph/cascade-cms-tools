// TODO: Narrow Content Rows
// TODO: Need to redo this using API

async function run() {
  const showRowContent = await global_ITS_getLocalStorage("showRowContent");
  if (!showRowContent) {
    return;
  }
  main();
}

// Check for menu edit button
// Add onclick event listener
// Check for data fields
// Acquire helpful data based on type of data field
// Append helpful data to Content Row body

class Menu {
  checkForEditButton() {
    const menuList = document.getElementById("menu-action");
    if (!menuList) {
      log("info", "verbose", "No Menu Action");
      return;
    }
    const editLink = menuList.querySelector("#edit-link");
    if (!editLink) {
      log("info", "verbose", "No Edit Link");
      return;
    }
    return editLink;
  }
}

class Content {
  constructor() {
    this.contentRows = null;
    this.currentFolder = null;
    this.parentFolder = null;
  }

  getPageBreadCrumbs() {
    const breadCrumbs = Array.from(
      document.querySelectorAll(
        ":scope .current-context-details > nav > ul > li"
      )
    ).filter((f) => !f.classList.contains("separator"));
    if (!breadCrumbs) {
      log("info", "verbose", "No Breadcrumbs");
      return;
    }
    const currentFolder = breadCrumbs
      .slice(1, breadCrumbs.length - 1)
      .reduce((t, el) => {
        return (t += `${el.textContent}/`);
      }, "");
    const parentFolder = breadCrumbs
      .slice(1, breadCrumbs.length - 2)
      .reduce((t, el, i, arr) => {
        return (t += `${el.textContent}/`);
      }, "");
    this.currentFolder = currentFolder;
    this.parentFolder = parentFolder;
  }

  addResumeEditingListener() {
    const resumeEditButton = document.getElementById("draft-overwrite-resume");
    if (!resumeEditButton) {
      log("info", "verbose", "resumeEditButton Not Found");
      return;
    }
    resumeEditButton.addEventListener("click", () => {
      setTimeout(checkContents, 2000);
    });
  }

  checkContentsForRows() {
    const checkForStructuredData = document.getElementById("structured-data");
    if (!checkForStructuredData) {
      log("info", "verbose", "structuredData Not Found");
      return;
    }
    const hasDataDefinitionID =
      checkForStructuredData.querySelector(".data-definition");
    if (!hasDataDefinitionID) {
      log("info", "verbose", "dataDefinition Not Found");
      return;
    }
    // const narrowContentRowNodeList = hasDataDefinitionID.querySelectorAll(
    //   `.sd-multi-group > .form-group.form-group-collapsible.sd-group.multi-group[data-sd-field-path="narrow-content/row"]`
    // );
    const contentRowNodeList = hasDataDefinitionID.querySelectorAll(
      `.sd-multi-group > .form-group.form-group-collapsible.sd-group.multi-group[data-sd-field-path="row"]`
    );
    if (!contentRowNodeList.length) {
      log("info", "verbose", "No Content Rows");
      return;
    }
    // if (!contentRowNodeList.length && !narrowContentRowNodeList.length) {
    //   return;
    // }
    const nodeList = { contentRowNodeList };
    return nodeList;
  }

  addCollapseListeners(contentRows) {
    for (const cRow of contentRows) {
      const collapseButton = cRow.querySelector(
        ".sd-group-button-root-collapse.collapsed.cs-tooltip"
      );
      collapseButton.addEventListener("click", () => {
        this.update(contentRows);
      });
    }
  }

  update(contentRows) {
    for (const cRow of contentRows) {
      const row = new Row(cRow, this.currentFolder, this.parentFolder);
      row
        .setIndex()
        .extractChildren()
        .mapToObj()
        .filterObjectForData()
        .createDivAndUpdate();
    }
  }
}

class Row {
  constructor(row, currentFolder, parentFolder) {
    this.globalFolder = "media/components/";
    this.currentFolder = currentFolder;
    this.parentFolder = parentFolder;
    this.row = row;
    this.children = null;
    this.rowObj = {};
    this.filtered = [];
    this.rowIndex = null;
  }

  setIndex() {
    this.rowIndex = this.row.dataset.index;
    return this;
  }

  extractChildren(firstElement = true) {
    let chosenComponentBody, children;
    if (firstElement) {
      chosenComponentBody = this.row.querySelector(
        ".form-group-collapsible-body.clearfix.collapse"
      );
      children = [...chosenComponentBody.children];
    } else {
      chosenComponentBody = this.row.querySelectorAll(
        ".form-group-collapsible-body.clearfix.collapse"
      );
      children = [];
      for (const child of chosenComponentBody) {
        [...child.children].forEach((c) => {
          children.push(c);
        });
      }
    }
    this.children = children;
    return this;
  }

  mapToObj() {
    this.rowObj = this.children.reduce((obj, htmlChild) => {
      const child = new Child(obj, htmlChild);
      obj = child.extract();
      return obj;
    }, {});
    return this;
  }

  filterObjectForData() {
    log("info", "verbose", this.rowObj);
    this.filtered = Object.keys(this.rowObj)
      .filter((k) => {
        const child = this.rowObj[k];
        const doNotInclude = !["type", "content"].includes(child.category);
        return child.hasData && doNotInclude;
      })
      .map((c) => {
        return this.rowObj[c];
      });
    return this;
  }

  objectsToHtml(useHR = true) {
    log("info", "verbose", this.filtered);
    return this.filtered.reduce(
      (s, childRow) => {
        const label = childRow.label;
        if (childRow.category == "block") {
          s += this.createHtmlString(childRow.values.component, {
            label,
            bold: true,
          });
          const isLocalMediaFolder =
            childRow.values.path.search(this.currentFolder + "media") > -1;
          const isParentFolder =
            childRow.values.path.search(this.parentFolder + "media") > -1;
          const isGlobalFolder = childRow.values.path.startsWith(
            this.globalFolder
          );
          const mediaLabel = "Component Location";
          let mediaValue = isGlobalFolder ? "Global (Don't Move)" : "External";
          if (isGlobalFolder || (!isLocalMediaFolder && !isParentFolder)) {
            s += this.createHtmlString(mediaValue, {
              label: mediaLabel,
              alert: true,
              bold: true,
            });
            s += this.createHtmlString(childRow.values.path, {
              label: "Path",
              alert: true,
              path: true,
              bold: true,
            });
          } else {
            mediaValue = isParentFolder ? "Parent" : "Internal";
            s += this.createHtmlString(mediaValue, {
              label: mediaLabel,
              alert: false,
              bold: true,
              warn: isParentFolder,
            });
            s += this.createHtmlString(childRow.values.path, {
              label: "Path",
              alert: false,
              path: true,
              bold: true,
              warn: isParentFolder,
            });
          }
        } else {
          log("info", "verbose", "childrow.values");
          log("info", "verbose", childRow.values);
          s += this.createHtmlString(childRow.values.join("\n"), {
            label,
            bold: true,
          });
        }
        return s;
      },
      useHR ? "<hr />" : ""
    );
  }

  createHtmlString(value, { label, alert, warn, bold, path } = {}) {
    let s = "<div";
    if (alert || warn) {
      if (path) {
        s += ` style="color:${warn ? "orange" : "red"};overflow-x:auto"`;
      } else {
        s += ` style="color:${warn ? "orange" : "red"};"`;
      }
    } else {
      if (path) {
        s += ` style="overflow-x:auto"`;
      }
    }
    s += ">";
    if (bold) {
      s += `<strong>${label}: </strong>`;
    } else {
      s += label + ": ";
    }
    s += value + "</div>\n";
    return s;
  }

  createDivAndUpdate() {
    if (!this.filtered.length) {
      log("info", "verbose", "No Filtered Content Rows");
      return;
    }
    const checkForExisting = document.getElementById(`ccr-${this.rowIndex}`);
    if (!checkForExisting) {
      const div = document.createElement("div");
      div.id = `ccr-${this.rowIndex}`;
      div.innerHTML = this.objectsToHtml();
      this.row.querySelector(".sd-group-button.collapsed").appendChild(div);
    } else {
      checkForExisting.innerHTML = this.objectsToHtml();
    }
  }
}

class Child {
  constructor(obj, htmlChild) {
    this.obj = obj;
    this.htmlChild = htmlChild;
  }

  extract() {
    switch (this.htmlChild.nodeName) {
      case "INPUT":
        const [id, category] = this.htmlChild.value.split(",");
        this.obj[id] = {
          category,
          id,
          label: "",
          hasData: false,
          values: [],
        };
        break;
      case "DIV":
        if (this.htmlChild.className === "sd-multi-group") {
          this.isNestedDiv();
        } else {
          this.isNotNestedDiv();
        }
        break;
      default:
        break;
    }
    return this.obj;
  }

  isNestedDiv() {
    const nestedType = this.htmlChild.dataset["sdFieldPath"];
    const curChild = this.htmlChild;
    const divId = curChild
      .querySelector("div:first-child")
      .id.split("dd-field-")[1];
    const curObj = this.obj[divId];
    if (divId && curObj) {
      if (nestedType === "row/column") {
        curObj.label = "Column: 1 (Top) | 2 (Bottom)";
      } else if (nestedType === "row/link") {
        curObj.label = "Link Details Below";
      }
      const nestedRow = new Row(this.htmlChild);
      const rowValues = nestedRow
        .extractChildren(false)
        .mapToObj()
        .filterObjectForData();
      if (rowValues.filtered.length) {
        curObj.hasData = true;
        curObj.values = [rowValues.objectsToHtml(false)];
      }
    }
  }

  isNotNestedDiv() {
    const curChild = this.htmlChild;
    const divId = curChild.id.split("dd-field-")[1];
    const curObj = this.obj[divId];
    if (divId && curObj) {
      curObj.label = curChild.querySelector("label").innerText.trim();
      curObj.hasData = !curChild.className.includes("hide");
      curObj.values = this.getValues(curObj.category, curChild);
    }
  }

  getValues(category, child) {
    const divTypes = {
      isSelectValues: ["bgColor", "align", "hr", "target"],
      isBlockValues: ["block", "internal"],
      isTextValues: ["heading", "external", "label"],
    };
    const [type] = Object.keys(divTypes).filter((k) => {
      return divTypes[k].includes(category);
    });
    if (!type) {
      return [];
    }
    return this[type](child);
  }

  isSelectValues(child) {
    return [child.querySelector("select").selectedOptions[0].value];
  }
  isBlockValues(child) {
    return {
      component: child
        .querySelector(".chooser-name.asset-chooser-name")
        .innerText.trim(),
      path: child
        .querySelector(".chooser-path.asset-chooser-path")
        .innerText.trim()
        .split(": /")[1],
    };
  }
  isTextValues(child) {
    return [child.querySelector("input[type=text]").value];
  }
}

const checkContents = async () => {
  const content = new Content();
  log("info", "basic", "Checking contents");
  await global_ITS_sleep({ s: 1 });
  await global_ITS_asyncInterval(global_ITS_isCascadeLoading);

  content.addResumeEditingListener();
  const contentRows = content.checkContentsForRows();
  // if (contentRows.narrowContentRowNodeList) {
  //   content.update(contentRows.narrowContentRowNodeList);
  // }

  if (contentRows.contentRowNodeList) {
    content.getPageBreadCrumbs();
    content.addCollapseListeners(contentRows.contentRowNodeList);
    content.update(contentRows.contentRowNodeList);
  }
};

async function main() {
  try {
    await global_ITS_asyncInterval(global_ITS_isCascadeLoading);
    log("info", "basic", "Cascade Page Loaded");
    const menu = new Menu();
    const editButton = menu.checkForEditButton();
    if (!editButton) {
      log("info", "verbose", "No Edit Button");
      return;
    }
    editButton.addEventListener("click", checkContents);
  } catch (error) {
    log("info", "verbose", error);
  }
}

// run();