import { createApp, h, type Component } from 'vue';
import {
    type ComponentRoot,
    type IntegrationOptions,
    type Integration
} from '../registry';

export default (promise: Promise<{ default: Component }>): Integration => {
    return async (
        { name, props, element }: IntegrationOptions
    ): Promise<ComponentRoot> => {
        const module = await promise;
        const component = module.default;

        return new Promise((resolve) => {
            const app = createApp({
                name: component.name + '-host',
                mounted() {
                    resolve({
                        root: app
                    });
                },
                render() {
                    return h(component, props);
                }
            });

            app.mount(element);
        });
    };
}
