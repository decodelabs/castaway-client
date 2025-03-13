import { getComponentLoader, getIntegration } from '../registry';

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

    get mounted() {
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

        const integration = await getIntegration(this.#framework);
        const loader = await getComponentLoader(src);

        this.#integrationRoot = integration(src, await loader(), this).then(() => {
            this._internals.states.add("mounted");
        });
    }
}

window.customElements.define('component-island', ComponentIsland);
