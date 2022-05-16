import { $, getElements, loadForm, saveForm } from "../modules/elements.mjs";
import { getCard, getCorrectAscension, sort } from "../modules/genshin.mjs";
import { load, save } from "../modules/storage.mjs";

const e = getElements();

function displayTargets() {
    e.targets.replaceChildren();
    const data = load("targets");
    const targets = Object.keys(data).map((name) => GenshinDb[data[name].type](name));
    targets.sort(sort);
    for (const target of targets) {
        e.targets.append(getCard(target, data[target.name]));
    }
}

for (const targetName of Object.keys(load("characters")).sort()) {
    e.target.list.append($("option", { value: `${targetName} (character)` }));
}
for (const targetName of Object.keys(load("weapons")).sort()) {
    e.target.list.append($("option", { value: `${targetName} (weapon)` }));
}

e.targets.addEventListener("click", (event) => {
    if (event.target.classList.contains("name")) {
        const data = load("targets");
        const name = event.target.closest(".card-genshin").title;
        e.target.edit.dialog.setAttribute("name", name);
        e.target.edit.weapons.style.display = data[name].type === "character" ? "" : "none";
        loadForm(e.target.edit, data[name]);
        e.target.edit.dialog.returnValue = "";
        e.target.edit.dialog.showModal();
    }
});

e.target.edit.dialog.addEventListener("close", () => {
    const returnValue = e.target.edit.dialog.returnValue;
    const data = load("targets");
    const name = e.target.edit.dialog.getAttribute("name");
    if (returnValue === "delete") {
        delete data[name];
        save(data);
        displayTargets();
    } else if (returnValue === "save") {
        saveForm(e.target.edit, data[name]);
        data[name].ascension = getCorrectAscension(data[name]);
        save(data);
        displayTargets();
    }
});

e.target.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const [name, type] = e.target.select.value.split(/ \(|\)/);
    const data = load("targets");
    if (!(name in data)) data[name] = { type, level: 1, ascension: 0, weapon: type === "character" ? true : undefined };
    save(data);
    displayTargets();
    e.target.select.value = "";
    document.querySelector(`#targets > [title="${name}"] > .name`).click();
});

displayTargets();
