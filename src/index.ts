import { type ComponentDefinition, defineComponents } from './registry';
import './components/component-island';
import './components/fragment-island';
import './components/layout-island';
import './components/page-island';
import { setupNavigation } from './navigation';

type CastawayAppOptions = {
    components?: ComponentDefinition
};

export const createCastawayApp = (options: CastawayAppOptions) => {
    defineComponents(options.components ?? {});
    setupNavigation();
};

export default createCastawayApp;
