const LOADED_NAME = Symbol();

export function load(name) {
    const data = JSON.parse(localStorage[name] || "{}");
    data[LOADED_NAME] = name;
    return data;
}

export function save(data) {
    const name = data[LOADED_NAME];
    localStorage[name] = JSON.stringify(data);
}
