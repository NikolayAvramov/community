"use client";

import { useEffect, useState } from "react";
import {
  CONTENT_VIEW_STORAGE_KEY,
  type ContentViewMode,
  isContentViewMode,
} from "@/lib/content-views";

export function useContentView(defaultView: ContentViewMode = "grid", storageKey = CONTENT_VIEW_STORAGE_KEY) {
  const [view, setView] = useState<ContentViewMode>(defaultView);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && isContentViewMode(saved)) {
      setView(saved);
    } else {
      setView(defaultView);
    }
    setReady(true);
  }, [defaultView, storageKey]);

  const changeView = (next: ContentViewMode) => {
    setView(next);
    localStorage.setItem(storageKey, next);
  };

  return { view, changeView, ready };
}
