import { defineComponents } from './registry.js';
import './components/component-island.js';
import './components/fragment-island.js';
import './components/page-island.js';

export const createCastawayApp = (options) => {
    defineComponents(options.components ?? {});
};

export default createCastawayApp;
