const capitalize = (str: string): string => {
    if (!str) return ""; // Handle empty or null strings
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const capitalizeWords = (sentence: string): string => {
    return sentence
        .split(" ")
        .map(word => capitalize(word))
        .join(" ");
}
