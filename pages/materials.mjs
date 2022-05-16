import { $, getElements } from "../modules/elements.mjs";
import { getCard, sort } from "../modules/genshin.mjs";
import { load, save } from "../modules/storage.mjs";

const e = getElements();

function displayMaterials() {
    e.materials.replaceChildren();
    const data = load("materials");
    const materials = Object.keys(data).map((name) => GenshinDb.materials(name));
    materials.sort(sort);
    for (const material of materials) {
        e.materials.append(getCard(material, data[material.name]));
    }
}

const materialNames = GenshinDb.materials("names", { matchCategories: true });
for (const materialName of materialNames) {
    e.material.list.append($("option", { value: materialName }));
}

e.materials.addEventListener("click", (event) => {
    if (event.target.classList.contains("quantity")) {
        const data = load("materials");
        const name = event.target.closest(".card-genshin").title;
        e.material.edit.dialog.setAttribute("name", name);
        e.material.edit.quantity.value = data[name];
        e.material.edit.dialog.returnValue = "";
        e.material.edit.dialog.showModal();
    }
});

e.material.edit.dialog.addEventListener("close", () => {
    const returnValue = e.material.edit.dialog.returnValue;
    const data = load("materials");
    const name = e.material.edit.dialog.getAttribute("name");
    if (returnValue === "delete") {
        delete data[name];
        save(data);
        displayMaterials();
    } else if (returnValue === "save") {
        data[name] = Number(e.material.edit.quantity.value);
        save(data);
        displayMaterials();
    }
});

e.material.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = e.material.select.value;
    const data = load("materials");
    if (!(name in data)) data[name] = 0;
    save(data);
    displayMaterials();
    e.material.select.value = "";
    document.querySelector(`#materials > [title="${name}"] > .quantity`).click();
});

displayMaterials();
