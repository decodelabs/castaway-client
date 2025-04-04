import { getIntegration } from '../registry';

class ComponentIsland extends HTMLElement {

    static observedAttributes = ['name', 'props'];

    #name: string | null;
    #props: object | null;
    _internals: ElementInternals;

    get name(): string | null {
        return this.#name;
    }

    get props(): object | null {
        return this.#props;
    }

    get mounted(): boolean {
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

    attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ): void {
        if (name === 'name') {
            this.#name = newValue;
        } else if (name === 'props') {
            this.#props = newValue ? JSON.parse(newValue) : null;
        } else {
            return;
        }

        if (this.mounted) {
            this.connectedCallback();
        }
    }
}

window.customElements.define('component-island', ComponentIsland);

export default ComponentIsland;
