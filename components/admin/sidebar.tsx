"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FormInput,
  Image,
  Layers,
  Settings,
  ArrowLeft,
  Layout,
  Navigation,
} from "lucide-react";
import { SPACE_LABEL } from "@/lib/space-labels";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Табло", icon: LayoutDashboard, exact: true },
  { href: "/admin/content", label: "Съдържание", icon: FileText },
  { href: "/admin/spaces", label: SPACE_LABEL.many, icon: Layers },
  { href: "/admin/fields", label: "Полета", icon: FormInput },
  { href: "/admin/forms", label: "Форми", icon: FormInput },
  { href: "/admin/pages", label: "Страници", icon: Layout },
  { href: "/admin/banners", label: "Банери", icon: Image },
  { href: "/admin/navigation", label: "Навигация", icon: Navigation },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-200/80 px-6 py-5 dark:border-slate-800">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Администрация</p>
        <h1 className="mt-1 text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Community CMS
        </h1>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/80 p-3 dark:border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Към сайта
        </Link>
      </div>
    </aside>
  );
}
