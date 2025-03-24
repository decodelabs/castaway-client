import { getIntegration } from '../registry';

class ComponentIsland extends HTMLElement {

    static observedAttributes = ['src', 'props'];

    #src;
    #props;

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
        if (!this.#src) {
            throw new Error('No component island src attribute found');
        }

        const integrate = await getIntegration(this.#src);

        await integrate({
            name: this.#src,
            props: this.#props ?? {},
            element: this
        });

        this._internals.states.add("mounted");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'src':
                this.#src = newValue;

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
