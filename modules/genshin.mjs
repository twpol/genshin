/*
    Genshin Impact servers reset at:

    Asia            4AM UTC+8
    Europe          4AM UTC+1
    North America   4AM UTC-5
*/

const SERVER_ASIA = "Asia";
const SERVER_EU = "Europe";
const SERVER_NA = "North America";
const WEEKDAYS = [null, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Try and guess which server the user is likely to be using from their timezone
export function getUserServer() {
    const utcOffset = luxon.DateTime.now().offset / 60;
    if (utcOffset > 4.5) return SERVER_ASIA;
    if (utcOffset > -2) return SERVER_EU;
    return SERVER_NA;
}

export function getUserDay() {
    return WEEKDAYS[getServerDate(getUserServer()).weekday];
}

function getServerDate(server) {
    switch (server) {
        case SERVER_ASIA:
            return getDateWithOffset(8);
        case SERVER_EU:
            return getDateWithOffset(1);
        case SERVER_NA:
            return getDateWithOffset(-5);
        default:
            throw new Error(`Unknown server: ${server}`);
    }
}

function getDateWithOffset(utcOffset) {
    return luxon.DateTime.now().setZone(utcOffset * 60);
}
