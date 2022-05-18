import { getElements } from "../modules/elements.mjs";
import { getCard, getCharacterLevelExperience, getWeaponLevelExperience } from "../modules/genshin.mjs";
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

const required = Object.create(null);

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
    const characterData = GenshinDb.character(character);

    const weaponSource = weapons[weapon];
    const weaponTarget = weaponSource ? target : null;
    const weaponData = GenshinDb.weapon(weapon);

    if (character)
        e.todo.list.append(
            getCard(characterData, {
                label: `${target.type[0]} ${characterSource.level} --> ${characterTarget.level}`,
            })
        );
    if (weapon)
        e.todo.list.append(
            getCard(weaponData, {
                label: `${target.type[0]} ${weaponSource.level} --> ${weaponTarget.level}`,
            })
        );

    if (character) {
        if (characterSource.level < characterTarget.level) {
            // TODO: Special consideration is needed for wasted EXP at ascension levels
            const { experience, mora } = getCharacterLevelExperience(characterSource.level, characterTarget.level);
            console.log(character, "level", characterSource.level, characterTarget.level, { experience, mora });
            required["Character EXP Material"] ||= 0;
            required["Character EXP Material"] += experience;
            required["Mora"] ||= 0;
            required["Mora"] += mora;
        }
        for (let ascension = characterSource.ascension + 1; ascension <= characterTarget.ascension; ascension++) {
            for (const cost of characterData.costs[`ascend${ascension}`]) {
                console.log(character, "ascension", ascension, cost);
                required[cost.name] ||= 0;
                required[cost.name] += cost.count;
            }
        }
        if (
            characterSource.talent1 < characterTarget.talent1 ||
            characterSource.talent2 < characterTarget.talent2 ||
            characterSource.talent3 < characterTarget.talent3
        ) {
            // TODO: Calculate character talent level up materials
        }
    }

    if (weapon) {
        if (weaponSource.level < weaponTarget.level) {
            // TODO: Special consideration is needed for wasted EXP at ascension levels
            const { experience, mora } = getWeaponLevelExperience(
                weaponData.rarity,
                weaponSource.level,
                weaponTarget.level
            );
            console.log(weapon, "level", weaponData.rarity, weaponSource.level, weaponTarget.level, {
                experience,
                mora,
            });
            required["Weapon Enhancement Material"] ||= 0;
            required["Weapon Enhancement Material"] += experience;
            required["Mora"] ||= 0;
            required["Mora"] += mora;
        }
        for (let ascension = weaponSource.ascension + 1; ascension <= weaponTarget.ascension; ascension++) {
            for (const cost of weaponData.costs[`ascend${ascension}`]) {
                console.log(weapon, "ascension", ascension, cost);
                required[cost.name] ||= 0;
                required[cost.name] += cost.count;
            }
        }
    }
}

console.log(required);
