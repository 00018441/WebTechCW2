import { isLetter } from "./is-letter.util.js";

function isUpperCase(letter) {
    return letter?.length === 1 && letter >= "A" && letter <= "Z";
}

// WARN: ignores non-letter characters
export function convertToSnakeCase(value = "") {
    const letters = [];

    for (let i = 0; i < value.length; ++i) {
        if (!isLetter(value[i])) {
            continue;
        }

        if (isUpperCase(value[i])) {
            letters.push(`_${value[i].toLowerCase()}`);
        } else {
            letters.push(value[i]);
        }
    }

    return letters.join("");
}
