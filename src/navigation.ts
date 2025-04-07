// Add types for window.navigation for use in this file. See https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types- for more info.
/// <reference types="navigation-api-types" />

import "@virtualstate/navigation/polyfill";
import PageIsland from "./components/page-island";
import replace from './page-replace';
import FragmentIsland from "./components/fragment-island";

type AdaptiveNavigateEvent = NavigateEvent & {
    originalEvent?: MouseEvent | SubmitEvent;
};

export const setupNavigation = () => {
    window.navigation?.addEventListener('navigate', (event: AdaptiveNavigateEvent) => {
        navigate(
            event.destination.url,
            (event.sourceElement ?? event.originalEvent?.target) as HTMLElement | null,
            event.formData,
            event
        );
    });

    document.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLAnchorElement;

        if (
            target.tagName === 'A' &&
            target.href &&
            target.hasAttribute('target') &&
            target.target !== '_top' &&
            target.target !== '_blank' &&
            !event.defaultPrevented
        ) {
            event.preventDefault();
            navigate(target.href, target);
        }
    });

    document.addEventListener('submit', (event: SubmitEvent) => {
        const target = event.target as HTMLFormElement;

        if (
            target.tagName === 'FORM' &&
            target.action &&
            target.target !== '_top' &&
            target.target !== '_blank' &&
            !event.defaultPrevented
        ) {
            event.preventDefault();
            navigate(target.action, target, new FormData(target));
        }
    });
};


const navigate = (
    url: string,
    inputTargetElement: HTMLElement | null = null,
    formData: FormData | null = null,
    navigateEvent: NavigateEvent | null = null,
) => {
    let targetElement: HTMLAnchorElement | HTMLFormElement | HTMLButtonElement | null = null;
    let target: string | null = null;

    if (inputTargetElement?.tagName === 'A') {
        targetElement = inputTargetElement as HTMLAnchorElement;
        target = targetElement.target;
    } else if (inputTargetElement?.tagName === 'FORM') {
        targetElement = inputTargetElement as HTMLFormElement;
        target = targetElement.target;
    } else if (inputTargetElement?.tagName === 'BUTTON') {
        targetElement = inputTargetElement as HTMLButtonElement;

        if (targetElement.formTarget) {
            target = targetElement.formTarget;
        } else {
            target = targetElement.closest('form')?.target ?? null;
        }
    }

    if (
        navigateEvent?.canIntercept === false ||
        target === '_top'
    ) {
        return;
    }

    targetElement?.classList.add('target-loading');
    let frame: FragmentIsland | PageIsland | null = null;

    if (
        (
            target === '_self' ||
            target === '_parent'
        ) &&
        targetElement
    ) {
        frame = targetElement.closest('page-island, fragment-island');

        if (target === '_parent' && frame) {
            frame = frame.parentElement?.closest('page-island, fragment-island') ?? null;
        }
    } else if (target) {
        frame = document.querySelector(`fragment-island[name=${target}]`);
        frame?.setAttribute('disabled', 'true');
        frame?.setAttribute('src', url);
        frame?.removeAttribute('disabled');
    } else {
        frame = document.querySelector("page-island");
    }

    if (!frame) {
        return;
    }

    const handler = () => loadDestination({
        url,
        frame,
        targetElement,
        method: formData ? 'POST' : 'GET',
        formData,
    }).then(() => {
        targetElement?.classList.remove('target-loading');
    });


    if (navigateEvent) {
        navigateEvent.intercept({
            focusReset: formData ? 'manual' : 'after-transition',
            scroll: formData ? 'manual' : 'after-transition',
            handler: handler
        });
    } else {
        handler();
    }
};

let abortController: AbortController;

export const loadDestination = async ({
    url, frame, targetElement, method, formData
}: {
    url: string,
    frame: FragmentIsland | PageIsland,
    targetElement?: HTMLElement | null,
    method: string,
    formData?: FormData | null
}): Promise<string> => {
    if (abortController) {
        abortController.abort();
    }

    abortController = new AbortController();
    const headers = {};
    frame._onLoadStart();

    const templateId = targetElement?.getAttribute('loading') || frame.getAttribute('loading');
    const template: HTMLTemplateElement | null = templateId ? document.querySelector(`template[id="${templateId}"]`) : null;

    if (template) {
        replace(frame, template.innerHTML);
    }

    if (frame.tagName === 'PAGE-ISLAND') {
        headers['X-Page-Island'] = 'page';
    } else {
        headers['X-Fragment-Island'] = frame.getAttribute('name') || 'default';
    }

    return fetch(url, {
        method,
        body: formData,
        headers,
        signal: abortController.signal,
    })
        .then(response => response.text())
        .then(data => {
            replace(frame, data);
            frame._onLoadEnd();
            return data;
        });
}
