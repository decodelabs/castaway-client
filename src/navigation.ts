// Add types for window.navigation for use in this file. See https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types- for more info.
/// <reference types="navigation-api-types" />

import "@virtualstate/navigation/polyfill";
import PageIsland from "./components/page-island";
import replace from './page-replace';
import FragmentIsland from "./components/fragment-island";

export const setupNavigation = () => {
    window.navigation?.addEventListener('navigate', (event: NavigateEvent) => {
        navigate(
            event.destination.url,
            event.target as HTMLElement | null,
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

    let method: string = 'GET';

    if (formData) {
        method = 'POST';
    }

    let frame: FragmentIsland | PageIsland | null = null;

    if (
        (
            target === '_self' ||
            target === '_parent'
        ) &&
        targetElement
    ) {
        frame = targetElement.closest('page-island, fragment-island');
        console.log('frame', frame);

        if (target === '_parent' && frame) {
            frame = frame.parentElement?.closest('page-island, fragment-island') ?? null;
            console.log('frame2', frame);
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


    if (navigateEvent) {
        navigateEvent.intercept({
            focusReset: formData ? 'manual' : 'after-transition',
            scroll: formData ? 'manual' : 'after-transition',
            handler: () => loadDestination(
                frame,
                url,
                method,
                formData,
            )
        });
    } else {
        loadDestination(
            frame,
            url,
            method,
            formData
        );
    }
};

export const loadDestination = async (
    frame: FragmentIsland | PageIsland,
    url: string,
    method: string,
    formData: FormData | null = null
) => {
    const headers = {};
    frame._onLoadStart();

    if (frame.tagName === 'PAGE-ISLAND') {
        headers['X-Page-Island'] = 'page';
    } else {
        headers['X-Fragment-Island'] = frame.getAttribute('name') || 'default';
    }

    fetch(url, {
        method,
        body: formData,
        headers
    })
        .then(response => response.text())
        .then(data => {
            replace(frame, data);
            frame._onLoadEnd();
        });
}
