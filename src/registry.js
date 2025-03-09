export const registry = {
    integrations: {},
    components: {},
};

export const defineIntegrations = (integrations) => {
    for (const [name, integration] of Object.entries(integrations)) {
        registry.integrations[name] = integration;
    }
};

export const getIntegration = async (name) => {
    return new Promise((resolve) => {
        if (registry.integrations[name]) {
            resolve(registry.integrations[name]);
        }

        setTimeout(() => {
            if (!registry.integrations[name]) {
                throw new Error(`No integration found for ${name}`);
            }

            resolve(registry.integrations[name]);
        }, 1);
    });
};

export const defineComponents = (components) => {
    for (const [name, loader] of Object.entries(components)) {
        registry.components[name] = loader;
    }
};

export const getComponentLoader = async (name) => {
    return new Promise((resolve) => {
        if (registry.components[name]) {
            resolve(registry.components[name]);
        }

        setTimeout(() => {
            if (!registry.components[name]) {
                throw new Error(`No component loader found for ${name}`);
            }

            resolve(registry.components[name]);
        }, 1);
    });
};
