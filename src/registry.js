export const bundled = {};

export const defineComponents = (components) => {
    for (const [name, loader] of Object.entries(components)) {
        bundled[name] = loader;
    }
};

export const getComponentLoader = async (name) => {
    return new Promise((resolve) => {
        if (bundled[name]) {
            resolve(bundled[name]);
        }

        setTimeout(() => {
            if (!bundled[name]) {
                throw new Error(`No component loader found for ${name}`);
            }

            resolve(bundled[name]);
        }, 1);
    });
};
