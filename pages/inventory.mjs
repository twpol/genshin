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

function addInventory(name, count) {
    const data = load("inventory");
    if (!(name in data)) data[name] = 0;
    data[name] += count;
    save(data);
    displayInventory();
}

const materialNames = GenshinDb.materials("names", { matchCategories: true });
for (const materialName of materialNames) {
    e.material.list.append($("option", { value: materialName }));
}

e.material.form.addEventListener("submit", (event) => {
    event.preventDefault();
    addInventory(e.material.select.value, 0);
    e.material.select.value = "";
});

displayInventory();
