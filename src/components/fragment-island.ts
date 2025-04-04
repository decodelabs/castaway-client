import { replace } from '../page-replace';

class FragmentIsland extends HTMLElement {

    static observedAttributes = ['src'];

    _internals: ElementInternals;

    constructor() {
        super();
        this._internals = this.attachInternals();
    }

    get mounted(): boolean {
        return this._internals.states.has("mounted");
    }

    get src(): string | null {
        return this.getAttribute('src');
    }

    attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ): void {
        if (
            this.hasAttribute('disabled') ||
            !newValue
        ) {
            return;
        }

        fetch(newValue, {
            method: 'GET',
            headers: {
                'X-Fragment-Island': this.id || 'default'
            },
        })
            .then(response => response.text())
            .then(data => {
                const dom = new DOMParser().parseFromString(data, 'text/html');
                replace(this, dom.body);
                this._internals.states.add("mounted");
            });
    }
}

window.customElements.define('fragment-island', FragmentIsland);

export default FragmentIsland;
