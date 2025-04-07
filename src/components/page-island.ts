let instance;

class PageIsland extends HTMLElement {

    _internals: ElementInternals;

    constructor() {
        super();
        this._internals = this.attachInternals();
    }

    get mounted(): boolean {
        return this._internals.states.has("mounted");
    }

    connectedCallback() {
        if (instance) {
            throw new Error('Only one instance of page-island is allowed');
        }

        instance = this;
    }

    disconnectedCallback() {
        instance = null;
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

window.customElements.define('page-island', PageIsland);

export default PageIsland;
