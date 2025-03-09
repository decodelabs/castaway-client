import { createRoot } from 'react-dom/client';

export default (element, component) => {
    return new Promise((resolve) => {
        const app = createRoot(element);
        app.render(component());
        resolve(app);
    });
};
