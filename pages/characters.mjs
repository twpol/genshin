import { $, getElements, loadForm, saveForm } from "../modules/elements.mjs";
import { getCharacterCard, getCorrectAscension, sort } from "../modules/genshin.mjs";
import { load, save } from "../modules/storage.mjs";

const e = getElements();

function displayCharacters() {
    e.characters.replaceChildren();
    const data = load("characters");
    const characters = Object.keys(data).map((name) => GenshinDb.characters(name));
    characters.sort(sort);
    for (const character of characters) {
        e.characters.append(getCharacterCard(character, data[character.name]));
    }
}

const characterNames = GenshinDb.characters("names", { matchCategories: true });
for (const characterName of characterNames) {
    e.character.list.append($("option", { value: characterName }));
}

e.characters.addEventListener("click", (event) => {
    if (event.target.classList.contains("name")) {
        const data = load("characters");
        const name = event.target.closest(".card-genshin").title;
        const talents = GenshinDb.talents(name);
        e.character.edit.dialog.setAttribute("name", name);
        e.character.edit.talents.style.display = talents ? "" : "none";
        if (talents) {
            e.character.edit.talent1name.innerText = talents.combat1.name;
            e.character.edit.talent2name.innerText = talents.combat2.name;
            e.character.edit.talent3name.innerText = talents.combat3.name;
        }
        loadForm(e.character.edit, data[name]);
        e.character.edit.dialog.returnValue = "";
        e.character.edit.dialog.showModal();
    }
});

e.character.edit.dialog.addEventListener("close", () => {
    const returnValue = e.character.edit.dialog.returnValue;
    const data = load("characters");
    const name = e.character.edit.dialog.getAttribute("name");
    if (returnValue === "delete") {
        delete data[name];
        save(data);
        displayCharacters();
    } else if (returnValue === "save") {
        saveForm(e.character.edit, data[name]);
        data[name].ascension = getCorrectAscension(data[name]);
        save(data);
        displayCharacters();
    }
});

e.character.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = e.character.select.value;
    const data = load("characters");
    if (!(name in data)) data[name] = { level: 1, ascension: 0, talent1: 1, talent2: 1, talent3: 1 };
    save(data);
    displayCharacters();
    e.character.select.value = "";
    document.querySelector(`#characters > [title="${name}"] > .name`).click();
});

displayCharacters();
