import { getComponentLoader, getIntegration } from '../registry';

class ComponentIsland extends HTMLElement {

    #framework;
    #src;
    #props;

    get framework() {
        return this.#framework;
    }

    get src() {
        return this.#src;
    }

    get props() {
        return this.#props;
    }

    get mounted() {
        return this._internals.states.has("mounted");
    }

    constructor() {
        super();
        this._internals = this.attachInternals();
    }

    async connectedCallback() {
        for (let attribute of this.attributes) {
            const match = attribute.name.match(/^([a-z]+):src$/);

            if (match) {
                this.#framework = match[1];
                this.#src = attribute.value;
                continue;
            }

            if (attribute.name === 'props') {
                this.#props = JSON.parse(attribute.value);
                continue;
            }
        }

        if (!this.#framework) {
            throw new Error('No component island framework:src attribute found');
        }

        const integration = await getIntegration(this.#framework);
        const loader = await getComponentLoader(this.#src);

        integration({
            name: this.#src,
            module: await loader(),
            props: this.#props ?? {},
            element: this
        }).then(() => {
            this._internals.states.add("mounted");
        });
    }
}

window.customElements.define('component-island', ComponentIsland);
