export function getRandomUnusedId(max, used) {
    let id = Math.floor(Math.random() * max);
    while (used.includes(id)) {
        id = Math.floor(Math.random() * max);
    }
    return id;
}
