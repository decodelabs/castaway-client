import { createRoot } from 'react-dom/client';

export default (promise) => {
    return async ({ name, props, element }) => {
        const module = await promise;
        const component = module[name] ?? module.default;

        return new Promise((resolve) => {
            const app = createRoot(element);
            app.render(component({ ...props }));
            resolve({
                root: app
            });
        });
    };
};
