/*
    Genshin Impact servers reset at:

    Asia            4AM UTC+8
    Europe          4AM UTC+1
    North America   4AM UTC-5
*/

import { $, loadForm, saveForm } from "./elements.mjs";
import { load, save } from "./storage.mjs";

const SERVER_ASIA = "Asia";
const SERVER_EU = "Europe";
const SERVER_NA = "North America";
const WEEKDAYS = [null, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ASCENSIONS = [20, 40, 50, 60, 70, 80, Infinity];

// Try and guess which server the user is likely to be using from their timezone
export function getUserServer() {
    const utcOffset = luxon.DateTime.now().offset / 60;
    if (utcOffset > 4.5) return SERVER_ASIA;
    if (utcOffset > -2) return SERVER_EU;
    return SERVER_NA;
}

export function getUserDay() {
    return WEEKDAYS[getServerDate(getUserServer()).weekday];
}

export function getGenshinType(object) {
    if ("birthday" in object) return "character";
    if ("weaponmaterialtype" in object) return "weapon";
    if ("materialtype" in object) return "material";
    throw new Error("Unknown Genshin object");
}

export function getCard(object, data) {
    const type = getGenshinType(object);
    if (type === "character") return getCharacterCard(object, data);
    if (type === "weapon") return getWeaponCard(object, data);
    if (type === "material") return getMaterialCard(object, data);
    throw new Error(`Unknown Genshin object type ${type}`);
}

function getCharacterCard(character, data) {
    return $(
        "div",
        { class: `card text-dark card-genshin character rarity-${character.rarity}`, title: character.name },
        $("img", { class: "card-img-top image", src: character.images.icon }),
        $("div", { class: "rarity" }, ...repeat(character.rarity, () => $("i", { class: "bi bi-star-fill" }))),
        $("div", { class: "card-body name" }, data ? `Lv. ${data.level}` : character.name)
    );
}

function getWeaponCard(weapon, data) {
    return $(
        "div",
        { class: `card text-dark card-genshin weapon rarity-${weapon.rarity}`, title: weapon.name },
        $("img", { class: "card-img-top image", src: weapon.images.icon }),
        $("div", { class: "rarity" }, ...repeat(weapon.rarity, () => $("i", { class: "bi bi-star-fill" }))),
        $("div", { class: "card-body name" }, data ? `Lv. ${data.level}` : weapon.name)
    );
}

function getMaterialCard(material, data) {
    return $(
        "div",
        { class: `card text-dark card-genshin material rarity-${material.rarity}`, title: material.name },
        $("img", { class: "card-img-top image", src: material.images.fandom }),
        $("div", { class: "rarity" }, ...repeat(material.rarity, () => $("i", { class: "bi bi-star-fill" }))),
        $("div", { class: "card-body name" }, data ? data.quantity : material.name)
    );
}

export function setGenshinUserList(e, type, defaultValue) {
    const base = e[type];
    const types = `${type}s`;

    function display() {
        base.list.replaceChildren();
        const data = load(types);
        const items = Object.keys(data).map((name) => GenshinDb[type](name));
        items.sort(sort);
        for (const item of items) {
            base.list.append(getCard(item, data[item.name]));
        }
    }

    base.list.addEventListener("click", (event) => {
        const card = event.target.closest(".card-genshin");
        if (!card) return;

        const data = load(types);
        const name = card.title;
        base.edit.dialog.dataset.name = name;
        if (base.edit.talents) {
            const talents = GenshinDb.talents(name);
            base.edit.talents.style.display = talents ? "" : "none";
            if (talents) {
                base.edit.talent1name.innerText = talents.combat1.name;
                base.edit.talent2name.innerText = talents.combat2.name;
                base.edit.talent3name.innerText = talents.combat3.name;
            }
        }
        if (base.edit.weapon) {
            const weapons = load("weapons");
            base.edit.weapon.replaceChildren();
            base.edit.weapon.append($("option", { value: "" }, "(none)"));
            for (const weaponName of Object.keys(weapons).sort()) {
                base.edit.weapon.append($("option", weaponName));
            }
        }
        loadForm(base.edit, data[name]);
        base.edit.dialog.returnValue = "";
        base.edit.dialog.showModal();
    });

    base.edit.dialog.addEventListener("close", () => {
        const returnValue = base.edit.dialog.returnValue;
        const data = load(types);
        const name = base.edit.dialog.dataset.name;
        if (returnValue === "delete") {
            delete data[name];
            save(data);
            display();
        } else if (returnValue === "save") {
            saveForm(base.edit, data[name]);
            if ("ascension" in data[name]) data[name].ascension = getCorrectAscension(data[name]);
            save(data);
            display();
        }
    });

    base.add.form.addEventListener("submit", (event) => {
        event.preventDefault();
        const option = base.add.select.selectedOptions[0];
        base.add.select.selectedIndex = 0;

        const data = load(types);
        const name = option.textContent;

        if (!(name in data)) data[name] = defaultValue;
        save(data);
        display();
        base.list.querySelector(`[title="${name}"]`).click();
    });
    for (const name of GenshinDb[type]("names", { matchCategories: true })) {
        base.add.select.append($("option", name));
    }

    display();
}

export function getCorrectAscension(data) {
    const ascension = ASCENSIONS.findIndex((a) => a >= data.level);
    if (data.level === ASCENSIONS[ascension]) {
        return Math.min(Math.max(data.ascension, ascension), ascension + 1);
    }
    return ascension;
}

export function sort(a, b) {
    if (a.sortorder || b.sortorder) return b.sortorder - a.sortorder;
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
}

function getServerDate(server) {
    switch (server) {
        case SERVER_ASIA:
            return getDateWithOffset(8);
        case SERVER_EU:
            return getDateWithOffset(1);
        case SERVER_NA:
            return getDateWithOffset(-5);
        default:
            throw new Error(`Unknown server: ${server}`);
    }
}

function getDateWithOffset(utcOffset) {
    return luxon.DateTime.now().setZone(utcOffset * 60);
}

function repeat(count, fn) {
    return Array.from(Array(Number(count) || 0).keys()).map((index) => fn(index));
}
