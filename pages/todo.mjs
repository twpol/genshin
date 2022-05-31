import { getElements, loadForm, saveForm } from "../modules/elements.mjs";
import { getCard, getCharacterLevelExperience, getWeaponLevelExperience, sort } from "../modules/genshin.mjs";
import { KEY, load, save } from "../modules/storage.mjs";

const e = getElements();

// TODO: Display possible domains to enter
// TODO: Allow editing quantity of materials
// TODO: Allow submitting domain results (adding materials to inventory)
// TODO: Allow submitting new character/talent/weapon levels (consuming materials from inventory)

const characters = load("characters");
const weapons = load("weapons");
const materials = load("materials");
const targets = load("targets");

const requiredQuantities = Object.create(null);
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

    if (character) {
        if (characterSource.level < characterTarget.level) {
            // TODO: Special consideration is needed for wasted EXP at ascension levels
            const { experience, mora } = getCharacterLevelExperience(characterSource.level, characterTarget.level);
            // console.log(character, "level", characterSource.level, characterTarget.level, { experience, mora });
            requiredQuantities["Character EXP Material"] ||= 0;
            requiredQuantities["Character EXP Material"] += experience;
            requiredQuantities["Mora"] ||= 0;
            requiredQuantities["Mora"] += mora;
        }
        for (let ascension = characterSource.ascension + 1; ascension <= characterTarget.ascension; ascension++) {
            for (const cost of characterData.costs[`ascend${ascension}`]) {
                // console.log(character, "ascension", ascension, cost);
                requiredQuantities[cost.name] ||= 0;
                requiredQuantities[cost.name] += cost.count;
            }
        }
        const talent = GenshinDb.talent(character);
        for (const talentName of ["talent1", "talent2", "talent3"]) {
            for (let level = characterSource[talentName] + 1; level <= characterTarget[talentName]; level++) {
                for (const cost of talent.costs[`lvl${level}`]) {
                    // console.log(character, talentName, level, cost);
                    requiredQuantities[cost.name] ||= 0;
                    requiredQuantities[cost.name] += cost.count;
                }
            }
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
            // console.log(weapon, "level", weaponData.rarity, weaponSource.level, weaponTarget.level, { experience, mora });
            requiredQuantities["Weapon Enhancement Material"] ||= 0;
            requiredQuantities["Weapon Enhancement Material"] += experience;
            requiredQuantities["Mora"] ||= 0;
            requiredQuantities["Mora"] += mora;
        }
        for (let ascension = weaponSource.ascension + 1; ascension <= weaponTarget.ascension; ascension++) {
            for (const cost of weaponData.costs[`ascend${ascension}`]) {
                // console.log(weapon, "ascension", ascension, cost);
                requiredQuantities[cost.name] ||= 0;
                requiredQuantities[cost.name] += cost.count;
            }
        }
    }
}

const extraMaterialData = Object.create(null);
const groups = Object.create(null);
for (const materialName of Object.keys(requiredQuantities)) {
    const material = GenshinDb.material(materialName);
    if (material) {
        const group = (groups[material.materialtype] =
            groups[material.materialtype] ||
            GenshinDb.materials(material.materialtype, { matchCategories: true }).map(GenshinDb.material).sort(sort));

        const groupPosition = group.findIndex((m) => m.name === material.name);
        for (let position = groupPosition; position + 1 < group.length; position++) {
            if (Number(group[position].rarity) !== 1 + Number(group[position + 1].rarity)) break;
            requiredQuantities[group[position + 1].name] ||= 0;
            extraMaterialData[group[position + 1].name] ||= Object.create(null);
            extraMaterialData[group[position + 1].name].provides = { [group[position].name]: 1 / 3 };
        }
    } else {
        // Special item... Character EXP Material, Weapon Enhancement Material
        extraMaterialData[materialName] ||= Object.create(null);
        extraMaterialData[materialName].sortorder = 1000000; // Sort to the front, so processed last
        const providedBy = GenshinDb.materials(materialName, { matchCategories: true });
        for (const material2 of providedBy.map(GenshinDb.material)) {
            const provides = parseInt(material2.description.match(/Gives ([\d,]+) EXP/)[1].replace(",", ""));
            requiredQuantities[material2.name] ||= 0;
            extraMaterialData[material2.name] ||= Object.create(null);
            extraMaterialData[material2.name].provides = { [materialName]: provides };
        }
    }
}

function display() {
    const requiredMaterials = Object.entries(requiredQuantities).map(([name, required]) => {
        const inventory = materials[name]?.quantity ?? 0;
        return {
            required,
            provided: inventory,
            inventory,
            name,
            ...extraMaterialData[name],
            ...GenshinDb.material(name),
        };
    });
    requiredMaterials.sort(sort);

    for (const material of requiredMaterials.slice().reverse()) {
        if (material.provides) {
            const [providedName, providedQuantity] = Object.entries(material.provides)[0];
            const providedMaterial = requiredMaterials.find((m) => m.name === providedName);
            const quantity = Math.floor(
                Math.round(Math.max(0, material.provided - material.required) * providedQuantity)
            );
            providedMaterial.provided += quantity;
            material.provided -= Math.round(quantity / providedQuantity);
            if (providedQuantity < 1) {
                material.crafted = true;
            } else {
                providedMaterial.providedBy ||= [];
                providedMaterial.providedBy.push(material);
                if (providedMaterial.provided > providedMaterial.required) {
                    providedMaterial.providedBy.forEach((m) => (m.satisfied = true));
                }
            }
        }
    }

    e.todo.list.replaceChildren();
    for (const material of requiredMaterials) {
        if (material.category) {
            const { required, provided, inventory, satisfied, crafted } = material;
            e.todo.list.append(
                getCard(material, {
                    [KEY]: material.name,
                    label: required ? `${inventory} / ${required}` : `${inventory}`,
                    icon: [
                        (required && provided >= required) || satisfied ? "check-square-fill" : "",
                        crafted ? "arrow-left-square" : "",
                    ].filter((i) => !!i),
                })
            );
        }
    }
}

e.todo.list.addEventListener("click", (event) => {
    const card = event.target.closest(".card-genshin");
    if (!card) return;

    const key = card.dataset.key;
    e.material.edit.dialog.dataset.key = key;
    if (!(key in materials)) materials[key] = { quantity: 0 };
    loadForm(e.material.edit, materials[key]);
    e.material.edit.dialog.returnValue = "";
    e.material.edit.dialog.showModal();
});

e.material.edit.dialog.addEventListener("close", () => {
    const returnValue = e.material.edit.dialog.returnValue;
    const key = e.material.edit.dialog.dataset.key;
    if (returnValue === "save") {
        saveForm(e.material.edit, materials[key]);
        save(materials);
        display();
    }
});

display();
