// src/types/resize-observer.d.ts
declare class ResizeObserver {
  constructor(callback: ResizeObserverCallback);
  observe(target: Element, options?: ResizeObserverOptions): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

declare type ResizeObserverCallback = (
  entries: ResizeObserverEntry[],
  observer: ResizeObserver
) => void;
declare type ResizeObserverOptions = boolean | ResizeObserverOptions;
declare type ResizeObserverEntry = {
  contentRect: DOMRectReadOnly;
  target: Element;
};
