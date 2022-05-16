import { getElements } from "../modules/elements.mjs";
import { setGenshinUserList } from "../modules/genshin.mjs";

const e = getElements();

setGenshinUserList(e, "target", {
    level: 1,
    ascension: 0,
});
