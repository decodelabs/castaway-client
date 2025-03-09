class ContentIsland extends HTMLElement {

    static observedAttributes = ['src'];

    constructor() {
        super();
        this._internals = this.attachInternals();
    }

    get collapsed() {
        return this._internals.states.has("mounted");
    }

    connectedCallback() {
    }

    disconnectedCallback() {
    }

    adoptedCallback() {
    }

    attributeChangedCallback(name, oldValue, newValue) {
        fetch(newValue, {
            method: 'GET',
            cache: 'force-cache',
            headers: {
                'X-Island': this.id || 'default'
            },
        })
            .then(response => response.text())
            .then(data => {
                const dom = new DOMParser().parseFromString(data, 'text/html');
                this.innerHTML = dom.querySelector('body').innerHTML;
                this._internals.states.add("mounted");
            });
    }
}

window.customElements.define('content-island', ContentIsland);
