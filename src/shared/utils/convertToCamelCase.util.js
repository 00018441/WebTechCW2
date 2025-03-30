function isLetter(char) {
    return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
}

export function convertToCamelCase(filename) {
    let newName = [];
    for (let i = 0; i < filename.length; ++i) {
        if (
            (i === 0 && isLetter(filename[0])) ||
            (filename[i - 1] === "_" && isLetter(filename[i]))
        ) {
            newName.push(filename[i].toUpperCase());
        } else if (isLetter(filename[i])) {
            newName.push(filename[i]);
        }
    }

    return newName.join("");
}
