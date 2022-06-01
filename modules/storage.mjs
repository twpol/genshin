const LOADED_NAME = Symbol();

export const KEY = Symbol();

/** @type {Map<string, Set<Function>>} */
const WATCHES = new Map();

export function load(name, changeCallback = null) {
    if (changeCallback) {
        watch(name, changeCallback);
    }
    const data = JSON.parse(localStorage[name] || "{}");
    data[LOADED_NAME] = name;
    for (const [name, value] of Object.entries(data)) {
        if (typeof value === "object") {
            value[KEY] = name;
        }
    }
    return data;
}

export function save(data) {
    const name = data[LOADED_NAME];
    localStorage[name] = JSON.stringify(data);
    change(name);
}

export function uuid() {
    let uuid = "";
    while (uuid.length < 32) {
        uuid += Math.random().toString(16).substring(2, 6);
    }
    return [
        uuid.substring(0, 8),
        uuid.substring(8, 12),
        uuid.substring(12, 16),
        uuid.substring(16, 20),
        uuid.substring(20, 32),
    ].join("-");
}

function watch(name, changeCallback) {
    if (!WATCHES.has(name)) {
        WATCHES.set(name, new Set());
    }
    WATCHES.get(name).add(changeCallback);
}

function change(name) {
    if (WATCHES.has(name)) {
        for (const changeCallback of WATCHES.get(name).keys()) {
            changeCallback();
        }
    }
}

addEventListener("storage", (event) => change(event.key));
