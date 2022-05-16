import { getElements } from "../modules/elements.mjs";
import { setGenshinUserList } from "../modules/genshin.mjs";

const e = getElements();

setGenshinUserList(e, "character", {
    level: 1,
    ascension: 0,
    talent1: 1,
    talent2: 1,
    talent3: 1,
});
