export const capitalizeFirstLetter = (word) => {
    if (word) {
        return word?.replace(/\b([a-zÁ-ú]{3,})/g, (w) => w?.charAt(0)?.toUpperCase() + w?.slice(1));
    }
    return null;
};

export const cleanupObject = (object) => {
    return Object.entries(object).reduce((acc, [key, value]) => {
        if (value) return { ...acc, [key]: value };
        return { ...acc };
    }, {});
};