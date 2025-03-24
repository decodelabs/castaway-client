import "@virtualstate/navigation/polyfill";
let instance;

class PageIsland extends HTMLElement {

    static observedAttributes = [];

    constructor() {
        super();
        this._internals = this.attachInternals();
    }

    get mounted() {
        return this._internals.states.has("mounted");
    }

    connectedCallback() {
        if (instance) {
            //throw new Error('Only one instance of page-island is allowed');
        }

        instance = this;

        window.navigation.addEventListener('navigate', async (event) => {
            if (!event.canIntercept) {
                return;
            }

            this._internals.states.delete("mounted");
            this._internals.states.add("loading");

            event.intercept({
                handler: async () => {
                    fetch(event.destination.url, {
                        method: 'GET',
                        headers: {
                            'X-Page-Island': 'page'
                        },
                    })
                        .then(response => response.text())
                        .then(data => {
                            const dom = new DOMParser().parseFromString(data, 'text/html');
                            const body = dom.querySelector('page-island') ?? dom.querySelector('body');

                            while (this.firstChild) {
                                this.removeChild(this.firstChild);
                            }

                            while (body.firstChild) {
                                this.appendChild(body.firstChild);
                            }

                            this._internals.states.delete("loading");
                            this._internals.states.add("mounted");
                        })
                }
            })
        });
    }

    disconnectedCallback() {
        instance = null;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(name, oldValue, newValue);
    }
}

window.customElements.define('page-island', PageIsland);
