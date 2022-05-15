/*
    Genshin Impact servers reset at:

    Asia            4AM UTC+8
    Europe          4AM UTC+1
    North America   4AM UTC-5
*/

import { $ } from "./elements.mjs";

const SERVER_ASIA = "Asia";
const SERVER_EU = "Europe";
const SERVER_NA = "North America";
const WEEKDAYS = [null, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ASCENSIONS = [20, 40, 50, 60, 70, 80];

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

export function getCharacterCard(character, data) {
    return $(
        "div",
        { class: `card text-dark card-genshin character rarity-${character.rarity}`, title: character.name },
        $("img", { class: "card-img-top image", src: character.images.icon }),
        $("div", { class: "rarity" }, ...repeat(character.rarity, () => $("i", { class: "bi bi-star-fill" }))),
        $("div", { class: "card-body name" }, data && data.level ? `Lv. ${data.level}` : character.name)
    );
}

export function getWeaponCard(weapon, data) {
    return $(
        "div",
        { class: `card text-dark card-genshin weapon rarity-${weapon.rarity}`, title: weapon.name },
        $("img", { class: "card-img-top image", src: weapon.images.icon }),
        $("div", { class: "rarity" }, ...repeat(weapon.rarity, () => $("i", { class: "bi bi-star-fill" }))),
        $("div", { class: "card-body name" }, data && data.level ? `Lv. ${data.level}` : weapon.name)
    );
}

export function getMaterialCard(material, count) {
    return $(
        "div",
        { class: `card text-dark card-genshin material rarity-${material.rarity}`, title: material.name },
        $("img", { class: "card-img-top image", src: material.images.fandom }),
        $("div", { class: "rarity" }, ...repeat(material.rarity, () => $("i", { class: "bi bi-star-fill" }))),
        ...(typeof count === "number" ? [$("div", { class: "card-footer quantity" }, count)] : [])
    );
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
