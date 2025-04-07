export type ComponentDefinition = {
    [key: string]: () => Promise<Integration>;
}

export type ComponentRoot = {
    root: object,
    update: (props: object) => void,
    destroy: () => void
}

export type IntegrationOptions = {
    name: string,
    props: object,
    element: HTMLElement
}

export type Integration = (options: IntegrationOptions) => Promise<ComponentRoot>

export const registry: {
    components: ComponentDefinition
} = {
    components: {},
};

export const defineComponents = (components: ComponentDefinition) => {
    for (const [name, loader] of Object.entries(components)) {
        registry.components[name] = loader;
    }
};

export const getIntegration = async (name: string): Promise<Integration> => {
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
