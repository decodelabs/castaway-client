export default function (oldPage, data) {
    const dom = new DOMParser().parseFromString(data, 'text/html');
    replaceMeta(document, dom);

    const oldLayout = document.querySelector('layout-island');
    const newLayout = dom.querySelector('layout-island');
    const newPage = dom.querySelector('page-island');

    const oldFragments = document.querySelectorAll('fragment-island');
    const oldComponents = document.querySelectorAll('component-island');

    const replaceFragments = [];
    const replaceComponents = [];

    oldFragments.forEach((oldFragment) => {
        const newFragment = dom.querySelector(`fragment-island[src="${oldFragment.src}"]`);

        if (newFragment) {
            newFragment.setAttribute('disabled', 'disabled');

            replaceFragments.push({
                oldFragment,
                newFragment
            });
        }
    });

    oldComponents.forEach((oldComponent) => {
        let selector = `component-island[name="${oldComponent.name}"]`;

        if (oldComponent.hasAttribute('props')) {
            selector += `[props='${oldComponent.getAttribute('props')}']`;
        } else {
            selector += `:not([props])`;
        }

        const newComponent = dom.querySelector(selector);

        if (newComponent) {
            newComponent.setAttribute('disabled', 'disabled');

            replaceComponents.push({
                oldComponent,
                newComponent
            });
        }
    });

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
            oldLayout.setAttribute('name', 'layout-' + Math.random().toString(36).substring(2, 11));
        } else {
            replace(oldPage, dom.body);
        }
    } else {
        // Replace body
        replace(document.body, dom.body);
    }

    replaceFragments.forEach(({ oldFragment, newFragment }) => newFragment.replaceWith(oldFragment));
    replaceComponents.forEach(({ oldComponent, newComponent }) => newComponent.replaceWith(oldComponent));
};

const replace = (oldEl, newEl) => {
    while (oldEl.firstChild) {
        oldEl.removeChild(oldEl.firstChild);
    }

    while (newEl.firstChild) {
        oldEl.appendChild(newEl.firstChild);
    }
};

const replaceMeta = (oldDoc, newDoc) => {
    oldDoc.title = newDoc.title;
    oldDoc.querySelectorAll('meta').forEach((metaTag) => metaTag.remove());
    newDoc.querySelectorAll('meta').forEach((metaTag) => oldDoc.head.appendChild(metaTag));
};
