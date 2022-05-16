import { getElements } from "../modules/elements.mjs";
import { getCard, getUserDay, getUserServer } from "../modules/genshin.mjs";

const e = getElements();

const server = getUserServer();
const day = getUserDay();

e.user.server.innerText = server;
e.user.day.innerText = day;

const characterNames = GenshinDb.characters("names", {
    matchCategories: true,
});

for (const characterName of characterNames) {
    const talents = GenshinDb.talents(characterName);
    if (!talents) continue;

    const talentMaterials = new Set(
        Object.values(talents.costs)
            .flat()
            .map((c) => c.name)
    );

    const talentMaterialDays = new Set(
        [...talentMaterials]
            .map((material) => GenshinDb.materials(material).daysofweek)
            .filter((days) => !!days)
            .flat()
    );

    if (talentMaterialDays.has(day)) {
        const character = GenshinDb.characters(characterName);
        e.talents.append(getCard(character));
    }
}

const weaponNames = GenshinDb.weapons("names", {
    matchCategories: true,
});

for (const weaponName of weaponNames) {
    const weapon = GenshinDb.weapons(weaponName);

    const weaponMaterials = new Set(
        Object.values(weapon.costs)
            .flat()
            .map((c) => c.name)
    );

    const weaponMaterialDays = new Set(
        [...weaponMaterials]
            .map((material) => GenshinDb.materials(material).daysofweek)
            .filter((days) => !!days)
            .flat()
    );

    if (weaponMaterialDays.has(day)) {
        e.weapons.append(getCard(weapon));
    }
}
