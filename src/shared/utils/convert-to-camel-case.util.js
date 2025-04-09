import { isLetter } from "./is-letter.util.js";

// WARN: ignores non-letter characters
// WARN: capitalizes the first letter
export function convertToCamelCase(value) {
    const letters = [];

    for (let i = 0; i < value.length; ++i) {
        if (!isLetter(value[i])) {
            continue;
        }

        if (i === 0 || value[i - 1] === "_") {
            letters.push(value[i].toUpperCase());
        } else {
            letters.push(value[i]);
        }
    }

    return letters.join("");
}
