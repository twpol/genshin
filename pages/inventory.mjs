import { $, getElements } from "../modules/elements.mjs";
import { getMaterialCard, sort } from "../modules/genshin.mjs";
import { load, save } from "../modules/storage.mjs";

const e = getElements();

function displayInventory() {
    e.inventory.replaceChildren();
    const data = load("inventory");
    const materials = Object.keys(data).map((name) => GenshinDb.materials(name));
    materials.sort(sort);
    for (const material of materials) {
        e.inventory.append(getMaterialCard(material, data[material.name]));
    }
}

const materialNames = GenshinDb.materials("names", { matchCategories: true });
for (const materialName of materialNames) {
    e.material.list.append($("option", { value: materialName }));
}

e.inventory.addEventListener("click", (event) => {
    if (event.target.classList.contains("quantity")) {
        const data = load("inventory");
        const name = event.target.closest(".card-genshin").title;
        e.material.edit.dialog.setAttribute("name", name);
        e.material.edit.quantity.value = data[name];
        e.material.edit.dialog.returnValue = "";
        e.material.edit.dialog.showModal();
    }
});

e.material.edit.dialog.addEventListener("close", () => {
    const returnValue = e.material.edit.dialog.returnValue;
    const data = load("inventory");
    const name = e.material.edit.dialog.getAttribute("name");
    if (returnValue === "delete") {
        delete data[name];
        save(data);
        displayInventory();
    } else if (returnValue === "save") {
        data[name] = Number(e.material.edit.quantity.value);
        save(data);
        displayInventory();
    }
});

e.material.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = e.material.select.value;
    const data = load("inventory");
    if (!(name in data)) data[name] = 0;
    save(data);
    displayInventory();
    e.material.select.value = "";
    document.querySelector(`#inventory > [title="${name}"] > .quantity`).click();
});

displayInventory();
