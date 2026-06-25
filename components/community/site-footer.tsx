import Link from "next/link";
import { Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative mt-16 border-t border-white/60 bg-white/70 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/70">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400">
              <Sparkles className="h-4 w-4" />
              Общност
            </div>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Място за идеи, разговори и събития — живо, цветно и отворено за всички мембъри.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Разгледай</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-slate-600 transition-colors hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Начало</Link></li>
                <li><Link href="/spaces" className="text-slate-600 transition-colors hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Секции</Link></li>
                <li><Link href="/members" className="text-slate-600 transition-colors hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Мембъри</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Участвай</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/create" className="text-slate-600 transition-colors hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Създай</Link></li>
                <li><Link href="/register" className="text-slate-600 transition-colors hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Регистрация</Link></li>
                <li><Link href="/search" className="text-slate-600 transition-colors hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Търсене</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-6 text-xs text-slate-400 dark:border-slate-800">
          <p>© {new Date().getFullYear()} Community</p>
          <p className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text font-medium text-transparent">
            Направено с ❤️ за общността
          </p>
        </div>
      </div>
    </footer>
  );
}
