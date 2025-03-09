import { createApp, h } from 'vue';

export default (element, component) => {
    return new Promise((resolve) => {
        const app = createApp({
            name: component.name + '-host',
            mounted() {
                resolve(app);
            },
            render() {
                return h(component);
            }
        });

        app.mount(element);
    });
};
