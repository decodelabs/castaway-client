import { createRoot } from 'react-dom/client';

export default (name, module, element) => {
    const component = module[name] ?? module.default;

    return new Promise((resolve) => {
        const app = createRoot(element);
        app.render(component());
        resolve(app);
    });
};
