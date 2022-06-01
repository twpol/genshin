import { getElements, setText } from "../modules/elements.mjs";
import { load, save, uuid } from "../modules/storage.mjs";

const STORAGE = ["characters", "weapons", "materials", "targets"];

const e = getElements();

const ably = new Ably.Realtime("6i5pIg.H_PALg:8_DP80abQeD46DAzXA9g7MHSbIb_dDhIN3Wkm3OIs6U");
const user = load("user");
const channel = user.global ? ably.channels.get(user.global) : undefined;
if (channel) {
    channel.subscribe("sync", (message) => {
        if (message.data.local !== user.local) {
            localStorage[message.data.name] = message.data.value;
            user.lastReceived = Date.now();
            save(user);
        }
    });
}

function display() {
    const user = load("user", display);

    if (`${channel?.name}` !== `${user.global}`) {
        location.reload();
    }

    if (!user.local) {
        user.local = uuid();
        save(user);
        return;
    }

    const query = new URLSearchParams(location.search);
    if (query.has("user.global")) {
        if (query.get("user.global") !== user.global) {
            user.global = query.get("user.global");
            delete user.lastSent;
            delete user.lastReceived;
            save(user);
        }
        location.replace(location.pathname);
        return;
    }

    setText(e.sync.user.local, user.local, "<em>none</em>");
    setText(e.sync.user.global, user.global, "<em>none</em>");
    setText(e.sync.user.last.sent, user.lastSent, "<em>never</em>", formatDateTime);
    setText(e.sync.user.last.received, user.lastReceived, "<em>never</em>", formatDateTime);
    for (const key of STORAGE) {
        setText(e.sync.user.data[key], localStorage[key], "<em>none</em>", formatData);
    }
    e.sync.user.unset.hidden = !!user.global;
    e.sync.user.set.hidden = !user.global;
    e.sync.user.link.href = `?user.global=${encodeURIComponent(user.global)}`;
}

function formatDateTime(value) {
    return new Date(value).toLocaleString();
}

function formatData(value) {
    return `${Object.keys(JSON.parse(value)).length} items (about ${value.length} bytes)`;
}

e.sync.user.generate.addEventListener("click", () => {
    const user = load("user", display);
    user.global = uuid();
    save(user);
});

e.sync.user.sync.addEventListener("click", () => {
    const user = load("user", display);
    for (const name of STORAGE) {
        channel.publish("sync", {
            local: user.local,
            name,
            value: localStorage[name] || "{}",
        });
    }
    user.lastSent = Date.now();
    save(user);
});

display();
