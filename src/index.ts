import { type ComponentDefinition, defineComponents } from './registry';
import './components/component-island';
import './components/fragment-island';
import './components/layout-island';
import './components/page-island';

type CastawayAppOptions = {
    components?: ComponentDefinition
};

export const createCastawayApp = (options: CastawayAppOptions) => {
    defineComponents(options.components ?? {});
};

export default createCastawayApp;
