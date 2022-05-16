import { getElements } from "../modules/elements.mjs";
import { setGenshinUserList } from "../modules/genshin.mjs";
import { load, save } from "../modules/storage.mjs";

const e = getElements();

function migrate1() {
    const data = load("materials");
    for (const [name, value] of Object.entries(data)) {
        if (typeof value === "number") {
            data[name] = { quantity: value };
        }
    }
    save(data);
}
migrate1();

setGenshinUserList(e, "material", {
    quantity: 0,
});
