export function parameterize(template, replacements) {
    let result = template;

    Object.keys(replacements).forEach((key) => {
        const value = replacements[key];
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder, "g"), value);
    });

    return result;
}
