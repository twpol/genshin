import { $, getElements, loadForm, saveForm } from "../modules/elements.mjs";
import {
    getCard,
    getUpgradeMaterials,
    getUpgrades,
    checkRequiredUpgradeMaterials,
    sortUpgrade,
} from "../modules/genshin.mjs";
import { KEY, load, save } from "../modules/storage.mjs";

const e = getElements();

// TODO: Display possible domains to enter
// TODO: Allow submitting domain results (adding materials to inventory)
// TODO: Allow submitting new character/talent/weapon levels (consuming materials from inventory)

function display() {
    const characters = load("characters", display);
    const weapons = load("weapons", display);
    const materials = load("materials", display);
    const targets = load("targets", display);

    const upgrades = [];
    for (const target of Object.values(targets)) {
        const character = target.type === "character" ? target[KEY] : null;
        const weapon =
            target.type === "weapon"
                ? target[KEY]
                : target.type === "character" && target.weapon
                ? characters[character].weapon || null
                : null;

        if (character) {
            upgrades.push(...getUpgrades("character", character, characters[character], target));
        }

        if (weapon) {
            upgrades.push(...getUpgrades("weapon", weapon, weapons[weapon], target));
        }
    }
    upgrades.sort(sortUpgrade);

    const upgradeMaterials = getUpgradeMaterials(materials, upgrades);

    e.todo.upgrade.actions.replaceChildren();
    const canUpgrade = Object.fromEntries(upgrades.map((upgrade) => [upgrade.name, true]));
    const maxUpgrade = Object.create(null);
    for (const upgrade of upgrades) {
        // Split this to avoid short-circuit evaluation skipping required method call
        const check = checkRequiredUpgradeMaterials(upgradeMaterials, upgrade);
        canUpgrade[upgrade.name] &&= check.all;
        maxUpgrade[upgrade.name] ||= upgrade.sort;
        e.todo.upgrade.actions.append(
            $(
                "tr",
                {
                    "data-upgrade": JSON.stringify(upgrade),
                },
                $("td", upgrade.name),
                $("td", TYPE_NAMES[upgrade.key]),
                $("td", upgrade.value),
                $(
                    "td",
                    canUpgrade[upgrade.name]
                        ? maxUpgrade[upgrade.name] === upgrade.sort
                            ? $("button", { class: "btn btn-sm btn-primary button-done" }, "Done")
                            : "Ready"
                        : ""
                )
            ),
            $(
                "tr",
                $(
                    "td",
                    { colspan: 4 },
                    $(
                        "div",
                        { class: "custom-card-grid editable" },
                        ...Object.keys(upgrade.consumes)
                            .map((name) => upgradeMaterials[name])
                            .map((material) => getCard(material, getCardUpgradeInfo(material, upgrade, check)))
                    )
                )
            )
        );
    }
}

function getCardUpgradeInfo(material, upgrade, check) {
    const EXP_MATERIALS = ["Character EXP Material", "Weapon Enhancement Material"];
    const directlyRequired = material.name in upgrade.requires || EXP_MATERIALS.includes(material.materialtype);
    const remainingQuantity = material.remaining + upgrade.consumes[material.name];
    const requiredQuantity = check.all ? upgrade.consumes[material.name] : upgrade.requires?.[material.name] ?? 0;
    return {
        [KEY]: material.name,
        icon: check[material.name] ? [directlyRequired ? "check-square-fill" : "arrow-left-square"] : [],
        label: `${remainingQuantity} / ${requiredQuantity}`,
    };
}

const TYPE_NAMES = {
    ascension: "Ascension level",
    level: "Level",
    talent1: "Talent 1 level",
    talent2: "Talent 2 level",
    talent3: "Talent 3 level",
};

e.todo.upgrade.actions.addEventListener("click", (event) => {
    const element = event.target.closest(".card-genshin, .button-done");
    if (!element) return;

    if (element.classList.contains("card-genshin")) {
        const materials = load("materials", display);
        const key = element.dataset.key;
        e.material.edit.dialog.dataset.key = key;
        if (!(key in materials)) {
            materials[key] = { quantity: 0 };
            save(materials);
        }
        loadForm(e.material.edit, materials[key]);
        e.material.edit.dialog.returnValue = "";
        e.material.edit.dialog.showModal();
    } else if (element.classList.contains("button-done")) {
        const upgrade = JSON.parse(element.closest("[data-upgrade]").dataset.upgrade);
        const materials = load("materials");
        const objects = load(`${upgrade.type}s`);
        objects[upgrade.name][upgrade.key] = upgrade.value;
        for (const [name, count] of Object.entries(upgrade.consumes)) {
            if (count) {
                materials[name].quantity -= count;
            }
        }
        save(materials);
        save(objects);
    }
});

e.material.edit.dialog.addEventListener("close", () => {
    const returnValue = e.material.edit.dialog.returnValue;
    const materials = load("materials", display);
    const key = e.material.edit.dialog.dataset.key;
    if (returnValue === "save") {
        saveForm(e.material.edit, materials[key]);
        save(materials);
    }
});

display();
