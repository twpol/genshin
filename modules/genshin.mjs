/*
    Genshin Impact servers reset at:

    Asia            4AM UTC+8
    Europe          4AM UTC+1
    North America   4AM UTC-5
*/

import { $, loadForm, saveForm } from "./elements.mjs";
import { KEY, load, save } from "./storage.mjs";

const SERVER_ASIA = "Asia";
const SERVER_EU = "Europe";
const SERVER_NA = "North America";

const WEEKDAYS = [null, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ASCENSION_MAX_LEVEL = [20, 40, 50, 60, 70, 80, 90];
const ASCENSION_MAX_TALENT = [1, 1, 2, 4, 6, 8, 10];

const SORT_LEVEL = {
    ascension: [null, ...ASCENSION_MAX_LEVEL.map((l) => l + 1)],
    talent1: [null, null, 47, 54, 57, 64, 67, 74, 77, 84, 87],
    talent2: [null, null, 48, 55, 58, 65, 68, 75, 78, 85, 88],
    talent3: [null, null, 49, 56, 59, 66, 69, 76, 79, 86, 89],
};

const CHARACTER_EXPERIENCE = [
    0, 0, 1000, 1325, 1700, 2150, 2625, 3150, 3725, 4350, 5000, 5700, 6450, 7225, 8050, 8925, 9825, 10750, 11725, 12725,
    13775, 14875, 16800, 18000, 19250, 20550, 21875, 23250, 24650, 26100, 27575, 29100, 30650, 32250, 33875, 35550,
    37250, 38975, 40750, 42575, 44425, 46300, 50625, 52700, 54775, 56900, 59075, 61275, 63525, 65800, 68125, 70475,
    76500, 79050, 81650, 84275, 86950, 89650, 92400, 95175, 98000, 100875, 108950, 112050, 115175, 118325, 121525,
    124775, 128075, 131400, 134775, 138175, 148700, 152375, 156075, 159825, 163600, 167425, 171300, 175225, 179175,
    183175, 216225, 243025, 273100, 306800, 344600, 386950, 434425, 487625, 547200,
];

const WEAPON_EXPERIENCE = [
    [],
    [
        0, 0, 125, 200, 275, 350, 475, 575, 700, 850, 1000, 1150, 1300, 1475, 1650, 1850, 2050, 2250, 2450, 2675, 2925,
        3150, 3575, 3825, 4100, 4400, 4700, 5000, 5300, 5600, 5925, 6275, 6600, 6950, 7325, 7675, 8050, 8425, 8825,
        9225, 9625, 10025, 10975, 11425, 11875, 12350, 12825, 13300, 13775, 14275, 14800, 15300, 16625, 17175, 17725,
        18300, 18875, 19475, 20075, 20675, 21300, 21925, 23675, 24350, 25025, 25700, 26400, 27125, 27825, 28550, 29275,
    ],
    [
        0, 0, 175, 275, 400, 550, 700, 875, 1050, 1250, 1475, 1700, 1950, 2225, 2475, 2775, 3050, 3375, 3700, 4025,
        4375, 4725, 5350, 5750, 6175, 6600, 7025, 7475, 7950, 8425, 8900, 9400, 9900, 10450, 10975, 11525, 12075, 12650,
        13225, 13825, 14425, 15050, 16450, 17125, 17825, 18525, 19225, 19950, 20675, 21425, 22175, 22950, 24925, 25750,
        26600, 27450, 28325, 29225, 30100, 31025, 31950, 32875, 35500, 36500, 37525, 38575, 39600, 40675, 41750, 42825,
        43900,
    ],
    [
        0, 0, 275, 425, 600, 800, 1025, 1275, 1550, 1850, 2175, 2500, 2875, 3250, 3650, 4050, 4500, 4950, 5400, 5900,
        6425, 6925, 7850, 8425, 9050, 9675, 10325, 10975, 11650, 12350, 13050, 13800, 14525, 15300, 16100, 16900, 17700,
        18550, 19400, 20275, 21175, 22050, 24150, 25125, 26125, 27150, 28200, 29250, 30325, 31425, 32550, 33650, 36550,
        37775, 39000, 40275, 41550, 42850, 44150, 45500, 46850, 48225, 52075, 53550, 55050, 56550, 58100, 59650, 61225,
        62800, 64400, 66025, 71075, 72825, 74575, 76350, 78150, 80000, 81850, 83700, 85575, 87500, 103275, 116075,
        130425, 146500, 164550, 184775, 207400, 232775, 261200,
    ],
    [
        0, 0, 400, 625, 900, 1200, 1550, 1950, 2350, 2800, 3300, 3800, 4350, 4925, 5525, 6150, 6800, 7500, 8200, 8950,
        9725, 10500, 11900, 12775, 13700, 14650, 15625, 16625, 17650, 18700, 19775, 20900, 22025, 23200, 24375, 25600,
        26825, 28100, 29400, 30725, 32075, 33425, 36575, 38075, 39600, 41150, 42725, 44325, 45950, 47600, 49300, 51000,
        55375, 57225, 59100, 61025, 62950, 64925, 66900, 68925, 70975, 73050, 78900, 81125, 83400, 85700, 88025, 90375,
        92750, 95150, 97575, 100050, 107675, 110325, 113000, 115700, 118425, 121200, 124000, 126825, 129675, 132575,
        156475, 175875, 197600, 221975, 249300, 279950, 314250, 352700, 395775,
    ],
    [
        0, 0, 600, 950, 1350, 1800, 2325, 2925, 3525, 4200, 4950, 5700, 6525, 7400, 8300, 9225, 10200, 11250, 12300,
        13425, 14600, 15750, 17850, 19175, 20550, 21975, 23450, 24950, 26475, 28050, 29675, 31350, 33050, 34800, 36575,
        38400, 40250, 42150, 44100, 46100, 48125, 50150, 54875, 57125, 59400, 61725, 64100, 66500, 68925, 71400, 73950,
        76500, 83075, 85850, 88650, 91550, 94425, 97400, 100350, 103400, 106475, 109575, 118350, 121700, 125100, 128550,
        132050, 135575, 139125, 142725, 146375, 150075, 161525, 165500, 169500, 173550, 177650, 181800, 186000, 190250,
        194525, 198875, 234725, 263825, 296400, 332975, 373950, 419925, 471375, 529050, 593675,
    ],
];

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
        {
            class: `card text-dark card-genshin character rarity-${character.rarity}`,
            "data-key": data?.[KEY],
            "data-type": data?.type,
            title: character.name,
        },
        $("img", { class: "card-img-top image", src: character.images.icon }),
        data?.icon ? $("div", { class: "icon" }, ...data.icon.map((icon) => $("i", { class: `bi bi-${icon}` }))) : "",
        $("div", { class: "rarity" }, ...repeat(character.rarity, () => $("i", { class: "bi bi-star-fill" }))),
        $("div", { class: "card-body name" }, data ? data.label || `Lv. ${data.level}` : character.name)
    );
}

function getWeaponCard(weapon, data) {
    return $(
        "div",
        {
            class: `card text-dark card-genshin weapon rarity-${weapon.rarity}`,
            "data-key": data?.[KEY],
            "data-type": data?.type,
            title: weapon.name,
        },
        $("img", { class: "card-img-top image", src: weapon.images.icon }),
        data?.icon ? $("div", { class: "icon" }, ...data.icon.map((icon) => $("i", { class: `bi bi-${icon}` }))) : "",
        $("div", { class: "rarity" }, ...repeat(weapon.rarity, () => $("i", { class: "bi bi-star-fill" }))),
        $("div", { class: "card-body name" }, data ? data.label || `Lv. ${data.level}` : weapon.name)
    );
}

function getMaterialCard(material, data) {
    return $(
        "div",
        {
            class: `card text-dark card-genshin material rarity-${material.rarity}`,
            "data-key": data?.[KEY],
            "data-type": data?.type,
            title: material.name,
        },
        $("img", { class: "card-img-top image", src: material.images.fandom }),
        data?.icon ? $("div", { class: "icon" }, ...data.icon.map((icon) => $("i", { class: `bi bi-${icon}` }))) : "",
        $("div", { class: "rarity" }, ...repeat(material.rarity, () => $("i", { class: "bi bi-star-fill" }))),
        $("div", { class: "card-body name" }, data ? data.label || data.quantity : material.name)
    );
}

export function setGenshinUserList(e, type, defaultValue) {
    const base = e[type];
    const types = `${type}s`;

    function display() {
        base.list.replaceChildren();
        base.edit.dialog.close();
        const data = load(types, display);
        const characters = type === "target" ? load("characters", display) : null;
        const items = Object.entries(data).map(([name, value]) => GenshinDb[value.type || type](name));
        items.sort(sort);
        for (const item of items) {
            base.list.append(getCard(item, data[item.name]));
            if (data[item.name].weapon && characters && characters[item.name].weapon) {
                base.list.append(getCard(GenshinDb.weapon(characters[item.name].weapon), data[item.name]));
            }
        }
    }

    base.list.addEventListener("click", (event) => {
        const card = event.target.closest(".card-genshin");
        if (!card) return;

        const data = load(types, display);
        const key = card.dataset.key;
        const type = card.dataset.type;
        base.edit.dialog.dataset.key = key;
        if (base.edit.talents) {
            const talents = GenshinDb.talents(key);
            base.edit.talents.style.display = talents ? "" : "none";
            if (talents) {
                base.edit.talent1name.innerText = talents.combat1.name;
                base.edit.talent2name.innerText = talents.combat2.name;
                base.edit.talent3name.innerText = talents.combat3.name;
            }
        }
        if (base.edit.weapon) {
            const weapons = load("weapons", display);
            base.edit.weapon.replaceChildren();
            base.edit.weapon.append($("option", { value: "" }, "(none)"));
            for (const weaponName of Object.keys(weapons).sort()) {
                base.edit.weapon.append($("option", weaponName));
            }
        }
        if (base.edit.weapons) {
            base.edit.weapons.style.display = type === "character" ? "" : "none";
        }
        loadForm(base.edit, data[key]);
        base.edit.dialog.returnValue = "";
        base.edit.dialog.showModal();
    });

    base.edit.dialog.addEventListener("close", () => {
        const returnValue = base.edit.dialog.returnValue;
        const data = load(types, display);
        const key = base.edit.dialog.dataset.key;
        if (returnValue === "delete") {
            delete data[key];
            save(data);
        } else if (returnValue === "save") {
            saveForm(base.edit, data[key]);
            if ("ascension" in data[key]) {
                data[key].ascension = getCorrectAscension(data[key]);
                if ("talent1" in data[key]) {
                    data[key].talent1 = getCorrectTalentLevel(data[key], "talent1");
                    data[key].talent2 = getCorrectTalentLevel(data[key], "talent2");
                    data[key].talent3 = getCorrectTalentLevel(data[key], "talent3");
                }
            }
            save(data);
        }
    });

    base.add.form.addEventListener("submit", (event) => {
        event.preventDefault();
        const option = base.add.select.selectedOptions[0];
        base.add.select.selectedIndex = 0;

        const data = load(types);
        const name = option.textContent;

        data[name] = { type: option.dataset.type, ...defaultValue, ...data[name] };
        save(data);
        base.list.querySelector(`[data-key="${name}"]`).click();
    });
    if (type === "target") {
        for (const name of Object.keys(load("characters"))) {
            base.add.select.append($("option", { "data-type": "character" }, name));
        }
        for (const name of Object.keys(load("weapons"))) {
            base.add.select.append($("option", { "data-type": "weapon" }, name));
        }
    } else {
        for (const name of GenshinDb[type]("names", { matchCategories: true })) {
            base.add.select.append($("option", name));
        }
    }

    display();
}

function getCorrectAscension(data) {
    const ascension = ASCENSION_MAX_LEVEL.findIndex((a) => a >= data.level);
    if (data.level === ASCENSION_MAX_LEVEL[ascension]) {
        return Math.min(Math.max(data.ascension, ascension), ascension + 1);
    }
    return ascension;
}

function getCorrectTalentLevel(data, key) {
    return Math.min(data[key], ASCENSION_MAX_TALENT[data.ascension]);
}

export function getCharacterLevelExperience(start, end) {
    const experience = range(start + 1, end + 1).reduce((total, level) => total + CHARACTER_EXPERIENCE[level], 0);
    const mora = experience / 5;
    return { experience, mora };
}

export function getWeaponLevelExperience(rarity, start, end) {
    const experience = range(start + 1, end + 1).reduce((total, level) => total + WEAPON_EXPERIENCE[rarity][level], 0);
    // TODO: Is this the correct way to adjust for Mora consumption or should it be per-level?
    const mora = Math.ceil(experience / 10);
    return { experience, mora };
}

function range(start, end) {
    return Array.from(new Array(end - start), (_, index) => index + start);
}

export function getUpgrades(type, name, source, target) {
    const upgrades = [];
    const data = GenshinDb[type](name);
    const talent = GenshinDb.talent(name);
    source = { ...source };
    while (
        source.talent1 < target.talent1 ||
        source.talent2 < target.talent2 ||
        source.talent3 < target.talent3 ||
        source.level < target.level ||
        source.ascension < target.ascension
    ) {
        const localTarget = {
            talent1: Math.min(target.talent1, ASCENSION_MAX_TALENT[source.ascension]),
            talent2: Math.min(target.talent2, ASCENSION_MAX_TALENT[source.ascension]),
            talent3: Math.min(target.talent3, ASCENSION_MAX_TALENT[source.ascension]),
            level: Math.min(target.level, ASCENSION_MAX_LEVEL[source.ascension]),
        };
        if (source.talent1 < localTarget.talent1) {
            upgrades.push({
                type,
                name,
                key: "talent1",
                value: source.talent1 + 1,
                requires: Object.fromEntries(
                    talent.costs[`lvl${source.talent1 + 1}`].map((cost) => [cost.name, cost.count])
                ),
            });
            source.talent1++;
        }
        if (source.talent2 < localTarget.talent2) {
            upgrades.push({
                type,
                name,
                key: "talent2",
                value: source.talent2 + 1,
                requires: Object.fromEntries(
                    talent.costs[`lvl${source.talent2 + 1}`].map((cost) => [cost.name, cost.count])
                ),
            });
            source.talent2++;
        }
        if (source.talent3 < localTarget.talent3) {
            upgrades.push({
                type,
                name,
                key: "talent3",
                value: source.talent3 + 1,
                requires: Object.fromEntries(
                    talent.costs[`lvl${source.talent3 + 1}`].map((cost) => [cost.name, cost.count])
                ),
            });
            source.talent3++;
        }
        if (source.level < localTarget.level) {
            const { experience, mora } =
                type === "character"
                    ? getCharacterLevelExperience(source.level, localTarget.level)
                    : getWeaponLevelExperience(data.rarity, source.level, localTarget.level);
            upgrades.push({
                type,
                name,
                key: "level",
                value: localTarget.level,
                requires: {
                    [type === "character" ? "Character EXP Material" : "Weapon Enhancement Material"]: experience,
                    Mora: mora,
                },
            });
            source.level = localTarget.level;
        }
        if (source.ascension < target.ascension) {
            upgrades.push({
                type,
                name,
                key: "ascension",
                value: source.ascension + 1,
                requires: Object.fromEntries(
                    data.costs[`ascend${source.ascension + 1}`].map((cost) => [cost.name, cost.count])
                ),
            });
            source.ascension++;
        }
    }
    upgrades.forEach((upgrade) => {
        upgrade.sort = SORT_LEVEL[upgrade.key]?.[upgrade.value] ?? upgrade.value;
    });
    return upgrades;
}

export function getUpgradeMaterials(materials, upgrades) {
    const possibleMaterials = new Set();
    for (const upgrade of upgrades) {
        for (const name of Object.keys(upgrade.requires)) {
            possibleMaterials.add(name);
        }
    }

    const extraMaterialData = Object.create(null);
    const groups = Object.create(null);
    for (const materialName of possibleMaterials) {
        const material = GenshinDb.material(materialName);
        if (material) {
            const group = (groups[material.materialtype] =
                groups[material.materialtype] ||
                GenshinDb.materials(material.materialtype, { matchCategories: true })
                    .map(GenshinDb.material)
                    .sort(sort));

            extraMaterialData[materialName] ||= Object.create(null);
            extraMaterialData[materialName].providedBy = Object.create(null);
            const groupPosition = group.findIndex((m) => m.name === material.name);
            for (let position = groupPosition; position < group.length; position++) {
                if (
                    position > groupPosition &&
                    Number(group[position - 1].rarity) !== 1 + Number(group[position].rarity)
                ) {
                    break;
                }
                possibleMaterials.add(group[position].name);
                extraMaterialData[materialName].providedBy[group[position].name] = Math.pow(
                    1 / 3,
                    position - groupPosition
                );
            }
        } else {
            // Special item... Character EXP Material, Weapon Enhancement Material
            extraMaterialData[materialName] ||= Object.create(null);
            extraMaterialData[materialName].sortorder = 1000000; // Sort to the front, so processed last
            extraMaterialData[materialName].providedBy = Object.create(null);
            const providedBy = GenshinDb.materials(materialName, { matchCategories: true });
            for (const material2 of providedBy.map(GenshinDb.material)) {
                const provides = parseInt(material2.description.match(/Gives ([\d,]+) EXP/)[1].replace(",", ""));
                possibleMaterials.add(material2.name);
                extraMaterialData[materialName].providedBy[material2.name] = provides;
            }
        }
    }

    const consumedMaterials = Object.fromEntries(
        Array.from(possibleMaterials).map((name) => {
            const inventory = materials[name]?.quantity ?? 0;
            return [
                name,
                {
                    remaining: inventory,
                    name,
                    ...extraMaterialData[name],
                    ...GenshinDb.material(name),
                },
            ];
        })
    );

    return consumedMaterials;
}

export function checkRequiredUpgradeMaterials(materials, upgrade) {
    upgrade.consumes = Object.create(null);
    const check = Object.create(null);
    check.all = true;
    for (const [name, requires] of Object.entries(upgrade.requires)) {
        let remaining = requires;
        const providedBys = Object.entries(materials[name].providedBy || { [name]: 1 }).sort(sortProvidedBy);
        const lastName = providedBys[providedBys.length - 1][0];
        for (const [name, provides] of providedBys) {
            // TODO: This does not account for Mora when crafting
            const use1 = Math.min(materials[name].remaining, Math.floor(remaining / provides));
            const use2 = name === lastName && use1 < materials[name].remaining && remaining > use1 * provides;
            const use = use1 + (use2 ? 1 : 0);
            upgrade.consumes[name] = use;
            materials[name].remaining -= use;
            remaining -= use * provides;
            check[name] = use > 0;
        }
        providedBys.forEach(([name]) => (check[name] &&= remaining <= 0));
        check[name] = remaining <= 0;
        check.all &&= check[name];
    }
    return check;
}

export function sort(a, b) {
    if (a.sortorder || b.sortorder) return b.sortorder - a.sortorder;
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
}

export function sortUpgrade(a, b) {
    return a.sort - b.sort;
}

function sortProvidedBy(a, b) {
    return b[1] - a[1];
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
