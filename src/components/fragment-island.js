class FragmentIsland extends HTMLElement {

    static observedAttributes = ['src'];

    constructor() {
        super();
        this._internals = this.attachInternals();
    }

    get mounted() {
        return this._internals.states.has("mounted");
    }

    get src() {
        return this.getAttribute('src');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.hasAttribute('disabled')) {
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
                const body = dom.querySelector('body');

                while (this.firstChild) {
                    this.removeChild(this.firstChild);
                }

                while (body.firstChild) {
                    this.appendChild(body.firstChild);
                }

                this._internals.states.add("mounted");
            });
    }
}

window.customElements.define('fragment-island', FragmentIsland);
