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

export function getCharacterCard(character) {
    return $(
        "div",
        { class: "card text-bg-light card-genshin-character" },
        $("img", { class: "card-img-top", src: character.images.cover1 }),
        $("div", { class: "card-body" }, $("h5", { class: "card-title" }, character.name))
    );
}

export function getWeaponCard(weapon) {
    return $(
        "div",
        { class: "card text-bg-light card-genshin-weapon" },
        $("img", { class: "card-img-top", src: weapon.images.image }),
        $("div", { class: "card-body" }, $("h5", { class: "card-title" }, weapon.name))
    );
}

export function getMaterialCard(material, count) {
    return $(
        "div",
        { class: `card text-dark border-0 card-genshin-material rarity-${material.rarity}`, title: material.name },
        $("img", { class: "card-img-top", src: material.images.fandom }),
        $(
            "div",
            { class: "card-genshin-rarity" },
            ...repeat(material.rarity, () => $("i", { class: "bi bi-star-fill" }))
        ),
        ...(typeof count === "number" ? [$("div", { class: "card-footer border-0 text-center" }, count)] : [])
    );
}

export function sort(a, b) {
    return b.sortorder - a.sortorder;
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
    return Array.from(Array(Number(count)).keys()).map((index) => fn(index));
}
