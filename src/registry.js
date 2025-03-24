export const registry = {
    components: {},
};

export const defineComponents = (components) => {
    for (const [name, loader] of Object.entries(components)) {
        registry.components[name] = loader;
    }
};

export const getIntegration = async (name) => {
    return new Promise((resolve) => {
        if (registry.components[name]) {
            resolve(registry.components[name]());
        }

        setTimeout(() => {
            if (!registry.components[name]) {
                throw new Error(`No component loader found for ${name}`);
            }

            resolve(registry.components[name]());
        }, 1);
    });
};
