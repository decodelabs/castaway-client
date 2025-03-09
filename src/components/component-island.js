import { getComponentLoader } from '@scripts/castaway';

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

        const integration = await import(`@scripts/castaway/${this.#framework}-integration.js`);
        const loader = getComponentLoader(src);

        if (!loader) {
            throw new Error(`No component loader found for ${this.#framework}:${src}`);
        }

        const componentModule = await loader();

        this.#integrationRoot = integration.default(this, componentModule.default).then(() => {
            this._internals.states.add("mounted");
        });
    }
}

window.customElements.define('component-island', ComponentIsland);
