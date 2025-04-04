import { createRoot } from 'react-dom/client';
import { type FC } from 'react';
import {
    type ComponentRoot,
    type IntegrationOptions,
    type Integration
} from '../registry';

export default (promise: Promise<{ [key: string]: FC }>): Integration => {
    return async (
        { name, props, element }: IntegrationOptions
    ): Promise<ComponentRoot> => {
        const module = await promise;
        const component: FC = module[name] ?? module.default;

        return new Promise((resolve) => {
            const app = createRoot(element);
            app.render(component({ ...props }));

            resolve({
                root: app
            });
        });
    };
};
