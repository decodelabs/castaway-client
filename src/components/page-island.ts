// Add types for window.navigation for use in this file. See https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types- for more info.
/// <reference types="navigation-api-types" />

import "@virtualstate/navigation/polyfill";
import replace from '../page-replace';
let instance;

class PageIsland extends HTMLElement {

    #eventHandler: (event: NavigateEvent) => Promise<void>;
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

        /**
         * We have to bundle the event handler and manually remove it
         * as the polyfill cannot react to Abort Controller on Firefox
         */
        this.#eventHandler = async (event: NavigateEvent) => {
            if (
                !event.canIntercept ||
                (event.target as HTMLAnchorElement)?.target === "_top" ||
                (event.target as HTMLAnchorElement)?.target === "_parent"
            ) {
                return;
            }

            let method: string = 'GET',
                body: FormData | null = null;

            if (event.formData) {
                method = 'POST';
                body = event.formData;
            }

            this._internals.states.delete("mounted");
            this._internals.states.add("loading");

            event.intercept({
                handler: async () => {
                    fetch(event.destination.url, {
                        method,
                        body,
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

        window.navigation?.addEventListener('navigate', this.#eventHandler);
    }

    disconnectedCallback() {
        instance = null;
        window.navigation?.removeEventListener('navigate', this.#eventHandler);
    }
}

window.customElements.define('page-island', PageIsland);

export default PageIsland;
