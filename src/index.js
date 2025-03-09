import {
    defineComponents as rawDefineComponents,
    defineIntegrations,
    getComponentLoader as rawGetComponentLoader,
    registry
} from './registry.js';
import './components/content-island.js';
import './components/component-island.js';

export const createCastawayApp = (options) => {
    defineIntegrations(options.integrations ?? {});
    defineComponents(options.components ?? {});

    return {
        components: registry.components,
        defineComponents,
        getComponentLoader
    };
};

export default createCastawayApp;

export const defineComponents = rawDefineComponents;
export const getComponentLoader = rawGetComponentLoader;
