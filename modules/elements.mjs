export function getElements() {
    const e = Object.create(null);
    for (const element of document.querySelectorAll("[id]")) {
        setByPath(e, element.id.split("-"), element);
    }
    return e;
}

function setByPath(root, path, value) {
    for (let i = 0; i < path.length - 1; i++) {
        root[path[i]] = root[path[i]] || Object.create(null);
        root = root[path[i]];
    }
    root[path[path.length - 1]] = value;
}

export function $(name, ...children) {
    const element = document.createElement(name);
    if (children.length && Object.getPrototypeOf(children[0]) === Object.prototype) {
        const attributes = children.shift();
        for (const attribute of Object.keys(attributes)) {
            element.setAttribute(attribute, attributes[attribute]);
        }
    }
    element.append(...children);
    return element;
}

export function loadForm(form, data) {
    for (const [name, element] of Object.entries(form)) {
        if (element.getAttribute("type") === "number") {
            if (typeof data[name] === "number") {
                element.value = data[name];
            } else {
                element.value = element.getAttribute("min");
            }
        } else if (element.nodeName === "SELECT") {
            element.value = data[name];
        } else if (element.getAttribute("type") === "checkbox") {
            element.checked = !!data[name];
        }
    }
}

export function saveForm(form, data) {
    for (const [name, element] of Object.entries(form)) {
        if (element.getAttribute("type") === "number") {
            data[name] = Number(element.value);
        } else if (element.nodeName === "SELECT") {
            data[name] = element.value;
        } else if (element.getAttribute("type") === "checkbox") {
            data[name] = element.checked ? true : undefined;
        }
    }
}
