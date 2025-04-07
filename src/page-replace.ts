import ComponentIsland from './components/component-island';
import FragmentIsland from './components/fragment-island';
import LayoutIsland, { newLayoutId } from './components/layout-island';
import PageIsland from './components/page-island';

export default function (
    oldPage: PageIsland | FragmentIsland,
    data: string
) {
    const dom = new DOMParser().parseFromString(data, 'text/html');
    const mergeDoc = oldPage.tagName === 'PAGE-ISLAND';

    if (mergeDoc) {
        replaceMeta(document, dom);
    }


    // Collect framgent and components to replace
    const oldFragments = document.querySelectorAll<FragmentIsland>('fragment-island');
    const oldComponents = document.querySelectorAll<ComponentIsland>('component-island');

    const replaceFragments: {
        oldFragment: FragmentIsland,
        newFragment: FragmentIsland
    }[] = [];

    const replaceComponents: {
        oldComponent: ComponentIsland,
        newComponent: ComponentIsland
    }[] = [];

    oldFragments.forEach((oldFragment: FragmentIsland) => {
        const newFragment = dom.querySelector<FragmentIsland>(`fragment-island[src="${oldFragment.src}"]`);

        if (newFragment) {
            newFragment.setAttribute('disabled', 'disabled');

            replaceFragments.push({
                oldFragment,
                newFragment
            });
        }
    });

    oldComponents.forEach((oldComponent: ComponentIsland) => {
        let selector = `component-island[name="${oldComponent.name}"]`;

        if (!oldComponent.hasAttribute('propagate')) {
            if (oldComponent.hasAttribute('props')) {
                selector += `[props='${oldComponent.getAttribute('props')}']`;
            } else {
                selector += `:not([props])`;
            }
        }

        const newComponent = dom.querySelector<ComponentIsland>(selector);

        if (newComponent) {
            newComponent.setAttribute('disabled', 'disabled');

            replaceComponents.push({
                oldComponent,
                newComponent
            });
        }
    });


    // Replace fragments and components
    const afterReplace = () => {
        replaceFragments.forEach(({ oldFragment, newFragment }) => newFragment.replaceWith(oldFragment));

        replaceComponents.forEach(({ oldComponent, newComponent }) => {
            newComponent.replaceWith(oldComponent);

            if (oldComponent.hasAttribute('propagate')) {
                if (newComponent.hasAttribute('props')) {
                    oldComponent.setAttribute('props', newComponent.getAttribute('props') as string);
                } else {
                    oldComponent.removeAttribute('props');
                }
            }
        });
    };


    // Replace layout or body
    if (mergeDoc) {
        const oldLayout = document.querySelector<LayoutIsland>('layout-island');
        const newLayout = dom.querySelector<LayoutIsland>('layout-island');
        const newPage = dom.querySelector<PageIsland>('page-island');

        if (oldLayout && newLayout) {
            if (oldLayout.name === newLayout.name) {
                // Replace page
                replace(oldPage, newPage ?? dom.body, afterReplace);
            } else {
                // Replace layout
                replace(oldLayout, newLayout, afterReplace);

                if (newLayout.hasAttribute('name')) {
                    oldLayout.setAttribute('name', newLayout.getAttribute('name') as string);
                } else {
                    oldLayout.removeAttribute('name');
                }
            }
        } else if (oldLayout) {
            // Replace layout with body
            if (newPage) {
                replace(oldLayout, dom.body, afterReplace);
                oldLayout.setAttribute('name', newLayoutId());
            } else {
                replace(oldPage, dom.body, afterReplace);
            }
        } else {
            // Replace body
            replace(document.body, dom.body, afterReplace);
        }
    } else {
        // Replace fragment
        replace(oldPage, dom.body, afterReplace);
    }
};

export const replace = (
    oldEl: HTMLElement,
    newEl: HTMLElement,
    afterReplace: (() => void) | null = null
) => {
    const replaceChildren = () => {
        while (oldEl.firstChild) {
            oldEl.removeChild(oldEl.firstChild);
        }

        while (newEl.firstChild) {
            oldEl.appendChild(newEl.firstChild);
        }

        if (afterReplace) {
            afterReplace();
        }
    };

    if (document.startViewTransition) {
        document.startViewTransition(replaceChildren);
    } else {
        replaceChildren();
    }
};

const replaceMeta = (
    oldDoc: Document,
    newDoc: Document
) => {
    oldDoc.title = newDoc.title;
    oldDoc.querySelectorAll('meta').forEach((metaTag) => metaTag.remove());
    newDoc.querySelectorAll('meta').forEach((metaTag) => oldDoc.head.appendChild(metaTag));
};
