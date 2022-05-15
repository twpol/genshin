import { $, getElements } from "../modules/elements.mjs";
import { getUserDay, getUserServer } from "../modules/genshin.mjs";

const e = getElements();

const server = getUserServer();
const day = getUserDay();

e.user.server.innerText = server;
e.user.day.innerText = day;

const characters = GenshinDb.characters("names", {
    matchCategories: true,
});

for (const character of characters) {
    const talents = GenshinDb.talents(character);
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
        e.characters.append($("li", { class: "list-group-item" }, character));
    }
}
