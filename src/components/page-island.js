import "@virtualstate/navigation/polyfill";
import replace from '../page-replace.js';
let instance;

class PageIsland extends HTMLElement {

    #eventHandler;

    constructor() {
        super();
        this._internals = this.attachInternals();
    }

    get mounted() {
        return this._internals.states.has("mounted");
    }

    connectedCallback() {
        if (instance) {
            throw new Error('Only one instance of page-island is allowed');
        }

        instance = this;

        /**
         * We have to bundle the event handler and manually remove it
         * as the polyfill cannot react to Abort Controller on Firefox
         */
        this.#eventHandler = async (event) => {
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
                            replace(this, data);

                            this._internals.states.delete("loading");
                            this._internals.states.add("mounted");
                        })
                }
            })
        };

        window.navigation.addEventListener('navigate', this.#eventHandler);
    }

    disconnectedCallback() {
        instance = null;
        window.navigation.removeEventListener('navigate', this.#eventHandler);
    }
}

window.customElements.define('page-island', PageIsland);
