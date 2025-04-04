import { getIntegration } from '../registry';

class ComponentIsland extends HTMLElement {

    static observedAttributes = ['name', 'props'];

    #name;
    #props;

    get name() {
        return this.#name;
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
        if (
            this.mounted ||
            this.hasAttribute('disabled')
        ) {
            return;
        }

        if (!this.#name) {
            throw new Error('No component island name attribute found');
        }

        const integrate = await getIntegration(this.#name);

        await integrate({
            name: this.#name,
            props: this.#props ?? {},
            element: this
        });

        this._internals.states.add("mounted");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'name':
                this.#name = newValue;

                if (this.mounted) {
                    this.connectedCallback();
                }
                break;

            case 'props':
                this.#props = JSON.parse(newValue);

                if (this.mounted) {
                    this.connectedCallback();
                }
                break;
        }
    }
}

window.customElements.define('component-island', ComponentIsland);
