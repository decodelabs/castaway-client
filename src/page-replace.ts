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

        if (oldComponent.hasAttribute('props')) {
            selector += `[props='${oldComponent.getAttribute('props')}']`;
        } else {
            selector += `:not([props])`;
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

    if (mergeDoc) {
        const oldLayout = document.querySelector<LayoutIsland>('layout-island');
        const newLayout = dom.querySelector<LayoutIsland>('layout-island');
        const newPage = dom.querySelector<PageIsland>('page-island');

        if (oldLayout && newLayout) {
            if (oldLayout.name === newLayout.name) {
                // Replace page
                replace(oldPage, newPage ?? dom.body);
            } else {
                // Replace layout
                replace(oldLayout, newLayout);
                oldLayout.setAttribute('name', newLayout.name);
            }
        } else if (oldLayout) {
            // Replace layout with body
            if (newPage) {
                replace(oldLayout, dom.body);
                oldLayout.setAttribute('name', newLayoutId());
            } else {
                replace(oldPage, dom.body);
            }
        } else {
            // Replace body
            replace(document.body, dom.body);
        }
    } else {
        // Replace fragment
        replace(oldPage, dom.body);
    }

    replaceFragments.forEach(({ oldFragment, newFragment }) => newFragment.replaceWith(oldFragment));
    replaceComponents.forEach(({ oldComponent, newComponent }) => newComponent.replaceWith(oldComponent));
};

export const replace = (
    oldEl: HTMLElement,
    newEl: HTMLElement
) => {
    while (oldEl.firstChild) {
        oldEl.removeChild(oldEl.firstChild);
    }

    while (newEl.firstChild) {
        oldEl.appendChild(newEl.firstChild);
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
