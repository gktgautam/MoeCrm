



import { useEffect } from 'react';
 

type LoadableQuery = {
  isLoading: boolean;
  isFetching: boolean;
};

export function useLoadingOverlay(
  query: LoadableQuery,
  selector: string,
  message = 'Loading...'
): void {
  useEffect(() => {
    if (!selector) return;

    if (query.isLoading || query.isFetching) {
      loadingStart(selector, message);
    } else {
      loadingStop(selector);
    }

    // On unmount, make sure overlay is removed
    return () => {
      loadingStop(selector);
    };
  }, [query.isLoading, query.isFetching, selector, message]);
}




export function loadingStart(elm: string, msg: string): void {
  const existingOverlay = document.querySelector<HTMLElement>(`#loading-${elm.slice(1)}-overlay`);
  if (existingOverlay) {
    existingOverlay.remove();
  }

  const target = document.querySelector<HTMLElement>(elm);
  if (target) {
    // Ensure position isn't overridden accidentally
    if (getComputedStyle(target).position === 'static') {
      target.style.position = 'relative';
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'loading-overlay-wrapper';
    wrapper.id = `loading-${elm.slice(1)}-overlay`;

    const container = document.createElement('div');
    container.className = 'loading-container';
    container.innerHTML = msg;

    const icon = document.createElement('i');
    icon.className = 'loading-spinner';

    container.appendChild(icon);
    wrapper.appendChild(container);
    target.appendChild(wrapper);
  }
}

export function loadingStop(elm: string): void {
  const overlay = document.querySelector<HTMLElement>(`#loading-${elm.slice(1)}-overlay`);
  if (overlay) {
    overlay.remove();
  }
}

