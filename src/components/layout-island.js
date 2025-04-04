let instance;

class LayoutIsland extends HTMLElement {

    static observedAttributes = ['name'];

    #name;

    constructor() {
        super();
        this._internals = this.attachInternals();
    }

    get name() {
        return this.#name;
    }

    get mounted() {
        return this._internals.states.has("mounted");
    }

    connectedCallback() {
        if (instance) {
            throw new Error('Only one instance of page-island is allowed');
        }

        instance = this;

        if (!this.#name) {
            this.#name = 'layout-' + Math.random().toString(36).substring(2, 11);
        }

        this._internals.states.add("mounted");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'name') {
            this.#name = newValue;
        }
    }
}

window.customElements.define('layout-island', LayoutIsland);
