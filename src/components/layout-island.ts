let instance;

export const newLayoutId = () => {
    return `layout-${Math.random().toString(36).substring(2, 11)}`;
};

class LayoutIsland extends HTMLElement {

    static observedAttributes = ['name'];

    #name: string;
    _internals: ElementInternals;

    constructor() {
        super();
        this._internals = this.attachInternals();
    }

    get name(): string {
        return this.#name;
    }

    get mounted(): boolean {
        return this._internals.states.has("mounted");
    }

    connectedCallback() {
        if (instance) {
            throw new Error('Only one instance of page-island is allowed');
        }

        instance = this;
        this.#name ??= newLayoutId();
        this._internals.states.add("mounted");
    }

    attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        if (name === 'name' && newValue) {
            this.#name = newValue;
        }
    }
}

window.customElements.define('layout-island', LayoutIsland);

export default LayoutIsland;


