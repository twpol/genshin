import { getElements } from "../modules/elements.mjs";
import { getCard } from "../modules/genshin.mjs";
import { KEY, load } from "../modules/storage.mjs";

const e = getElements();

// TODO: Calculate and display required materials from characters/weapons/targets
// TODO: Display when materials are sufficient
// TODO: Display possible domains to enter
// TODO: Allow editing quantity of materials
// TODO: Allow submitting domain results (adding materials to inventory)
// TODO: Allow submitting new character/talent/weapon levels (consuming materials from inventory)

const characters = load("characters");
const weapons = load("weapons");
const materials = load("materials");
const targets = load("targets");
for (const target of Object.values(targets)) {
    const character = target.type === "character" ? target[KEY] : null;
    const weapon =
        target.type === "weapon"
            ? target[KEY]
            : target.type === "character" && target.weapon
            ? characters[character].weapon || null
            : null;

    const characterSource = characters[character];
    const characterTarget = characterSource ? target : null;
    const weaponSource = weapons[weapon];
    const weaponTarget = weaponSource ? target : null;

    if (character) e.todo.list.append(getCard(GenshinDb.character(character), { label: `${target.type[0]} ${characterSource.level} --> ${characterTarget.level}`}));
    if (weapon) e.todo.list.append(getCard(GenshinDb.weapon(weapon), { label: `${target.type[0]} ${weaponSource.level} --> ${weaponTarget.level}`}));
}
