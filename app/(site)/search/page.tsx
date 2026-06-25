"use client";

import { Suspense } from "react";
import SearchPageContent from "./search-content";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Зареждане...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
