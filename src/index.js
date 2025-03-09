import { defineComponents as a, getComponentLoader as b, bundled } from './registry.js';
import './components/content-island.js';
import './components/component-island.js';

export const createCastawayApp = (options) => {
    defineComponents(options.components ?? {});

    return {
        components: bundled,
        defineComponents,
        getComponentLoader
    };
};

export default createCastawayApp;

export const defineComponents = a;
export const getComponentLoader = b;
