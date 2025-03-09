import './components/content-island.js';
import './components/component-island.js';

let bundled = {};

export const createCastawayApp = (options) => {
    defineComponents(options.components ?? {});

    return {
        components: bundled,
        defineComponents,
        getComponentLoader
    };
};

export default createCastawayApp;

export const defineComponents = (components) => {
    bundled = {
        ...bundled,
        ...components
    };
};

export const getComponentLoader = (name) => {
    return bundled[name];
};
