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
                name: name + '-host',

                data() {
                    return props;
                },

                mounted() {
                    resolve({
                        root: app,
                        update: (newProps: object) => {
                            Object.keys(newProps).forEach((key) => {
                                props[key] = newProps[key];
                            });

                            this.$forceUpdate();
                        },
                        destroy: () => {
                            app.unmount();
                        }
                    });
                },
                render() {
                    return h(component, this.$data);
                }
            });

            app.mount(element);
        });
    };
}
