import { getElements } from "../modules/elements.mjs";
import { getCharacterCard, getUserDay, getUserServer } from "../modules/genshin.mjs";

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

    const talentDays = new Set(
        [...talentMaterials]
            .map((material) => GenshinDb.materials(material).daysofweek)
            .filter((days) => !!days)
            .flat()
    );

    if (talentDays.has(day)) {
        const character = GenshinDb.characters(characterName);
        e.characters.append(getCharacterCard(character));
    }
}
