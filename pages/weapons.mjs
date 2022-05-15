import { $, getElements, loadForm, saveForm } from "../modules/elements.mjs";
import { getWeaponCard, sort } from "../modules/genshin.mjs";
import { load, save } from "../modules/storage.mjs";

const e = getElements();

function displayWeapons() {
    e.weapons.replaceChildren();
    const data = load("weapons");
    const weapons = Object.keys(data).map((name) => GenshinDb.weapons(name));
    weapons.sort(sort);
    for (const weapon of weapons) {
        e.weapons.append(getWeaponCard(weapon, data[weapon.name]));
    }
}

const weaponNames = GenshinDb.weapons("names", { matchCategories: true });
for (const weaponName of weaponNames) {
    e.weapon.list.append($("option", { value: weaponName }));
}

e.weapons.addEventListener("click", (event) => {
    if (event.target.classList.contains("name")) {
        const data = load("weapons");
        const name = event.target.closest(".card-genshin").title;
        e.weapon.edit.dialog.setAttribute("name", name);
        loadForm(e.weapon.edit, data[name]);
        e.weapon.edit.dialog.returnValue = "";
        e.weapon.edit.dialog.showModal();
    }
});

e.weapon.edit.dialog.addEventListener("close", () => {
    const returnValue = e.weapon.edit.dialog.returnValue;
    const data = load("weapons");
    const name = e.weapon.edit.dialog.getAttribute("name");
    if (returnValue === "delete") {
        delete data[name];
        save(data);
        displayWeapons();
    } else if (returnValue === "save") {
        saveForm(e.weapon.edit, data[name]);
        save(data);
        displayWeapons();
    }
});

e.weapon.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = e.weapon.select.value;
    const data = load("weapons");
    if (!(name in data)) data[name] = { level: 1, ascension: 0 };
    save(data);
    displayWeapons();
    e.weapon.select.value = "";
    document.querySelector(`#weapons > [title="${name}"] > .name`).click();
});

displayWeapons();
