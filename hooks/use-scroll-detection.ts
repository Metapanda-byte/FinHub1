"use client";

import { useEffect, useRef } from "react";

export function useScrollDetection<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const checkScrollable = () => {
      const isScrollable = element.scrollWidth > element.clientWidth;
      if (isScrollable) {
        element.classList.add("scrollable");
      } else {
        element.classList.remove("scrollable");
      }
    };

    // Check initially
    checkScrollable();

    // Check on resize
    const resizeObserver = new ResizeObserver(checkScrollable);
    resizeObserver.observe(element);

    // Check on mutation (content changes)
    const mutationObserver = new MutationObserver(checkScrollable);
    mutationObserver.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return ref;
} 