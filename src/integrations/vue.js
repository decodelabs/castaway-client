import { createApp, h } from 'vue';

export default (promise) => {
    return async ({ name, props, element }) => {
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
