import { loadDestination } from '../navigation';
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

        loadDestination({
            url: newValue,
            frame: this,
            method: 'GET'
        });
    }

    _onLoadStart() {
        this._internals.states.delete("mounted");
        this._internals.states.add("loading");
    }

    _onLoadEnd() {
        this._internals.states.delete("loading");
        this._internals.states.add("mounted");
    }
}

window.customElements.define('fragment-island', FragmentIsland);

export default FragmentIsland;
