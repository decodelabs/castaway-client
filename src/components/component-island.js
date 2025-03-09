import { getComponentLoader } from '../registry';
import vueIntegration from '../integrations/vue.js';
import reactIntegration from '../integrations/react.js';

class ComponentIsland extends HTMLElement {

    static observedAttributes = [];

    #framework;
    #integrationRoot;

    get framework() {
        return this.#framework;
    }

    constructor() {
        super();
        this._internals = this.attachInternals();
    }

    get collapsed() {
        return this._internals.states.has("mounted");
    }

    async connectedCallback() {
        let src;

        for (let attribute of this.attributes) {
            const match = attribute.name.match(/^([a-z]+):src$/);

            if (match) {
                this.#framework = match[1];
                src = attribute.value;
                break;
            }
        }

        if (!this.#framework) {
            throw new Error('No component island framework:src attribute found');
        }

        let integration;

        switch (this.#framework) {
            case 'vue':
                integration = vueIntegration;
                break;

            case 'react':
                integration = reactIntegration;
                break;

            default:
                throw new Error(`No component integration found for ${this.#framework}:${src}`);
        }

        const loader = await getComponentLoader(src);

        if (!loader) {
            throw new Error(`No component loader found for ${this.#framework}:${src}`);
        }

        const componentModule = await loader();

        this.#integrationRoot = integration(this, componentModule.default).then(() => {
            this._internals.states.add("mounted");
        });
    }
}

window.customElements.define('component-island', ComponentIsland);
