"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/app/context/AuthContext";
import { SiteSearch } from "@/components/community/site-search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SPACE_LABEL } from "@/lib/space-labels";
import { cn } from "@/lib/utils";
import { ChevronDown, LogOut, Menu, MessageCircle, Plus, Shield, User, Users, X } from "lucide-react";

type NavItem = { label: string; href: string };
type SiteBranding = { siteName: string; logoUrl?: string; primaryColor?: string };

const DEFAULT_NAV: NavItem[] = [
  { label: "Начало", href: "/" },
  { label: SPACE_LABEL.many, href: "/spaces" },
];

const RIGHT_ICON_NAV = [
  { label: "Мембъри", href: "/members", icon: Users },
  { label: "Съобщения", href: "/messages", icon: MessageCircle },
] as const;

const RIGHT_NAV_HREFS = new Set<string>(RIGHT_ICON_NAV.map((item) => item.href));

function NavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
        active
          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25"
          : "text-slate-600 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-400 dark:hover:bg-violet-950/40 dark:hover:text-violet-300",
      )}
    >
      {item.label}
    </Link>
  );
}

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function IconNavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof Users;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
        active
          ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
          : "text-slate-500 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-400 dark:hover:bg-violet-950/40 dark:hover:text-violet-300",
      )}
    >
      <Icon className="h-5 w-5" />
    </Link>
  );
}

const VISIBLE_NAV_COUNT = 5;

export default function SiteNavigation() {
  const pathname = usePathname();
  const { user, logout, loading } = useContext(AuthContext);
  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAV);
  const [branding, setBranding] = useState<SiteBranding>({ siteName: "Community" });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/navigation")
      .then((r) => r.json())
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setNavItems(
            items
              .map((i: { label: string; href: string }) => ({ label: i.label, href: i.href }))
              .filter((i) => !RIGHT_NAV_HREFS.has(i.href)),
          );
        }
      })
      .catch(() => {});

    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.siteName) {
          setBranding(data);
          if (data.primaryColor) {
            document.documentElement.style.setProperty("--primary", data.primaryColor);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const brandColor = branding.primaryColor ?? "#6366f1";
  const mainNavItems = navItems.filter((item) => !RIGHT_NAV_HREFS.has(item.href));
  const visibleNav = mainNavItems.slice(0, VISIBLE_NAV_COUNT);
  const overflowNav = mainNavItems.slice(VISIBLE_NAV_COUNT);

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/85">
      {/* Top row: logo, search, actions */}
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200/80" />
          ) : (
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
              style={{ backgroundColor: brandColor }}
            >
              {branding.siteName.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="hidden max-w-[140px] truncate text-base text-slate-900 lg:inline dark:text-slate-50">
            {branding.siteName}
          </span>
        </Link>

        <SiteSearch className="hidden min-w-0 flex-1 sm:block sm:max-w-xs lg:max-w-sm" compact />

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {loading && <span className="h-8 w-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />}

          {!loading && (
            <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 dark:border-slate-800">
              {RIGHT_ICON_NAV.map(({ href, label, icon }) => (
                <IconNavLink
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  active={isNavActive(pathname, href)}
                />
              ))}
            </div>
          )}

          {!loading && user && (
            <>
              <Link href="/create" className="hidden sm:block">
                <Button size="sm" className="gap-1.5 shadow-sm" style={{ backgroundColor: brandColor }}>
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">Създай</span>
                </Button>
              </Link>
              {(user.role === "ADMIN" || user.role === "SUPPORT") && (
                <Link href="/admin" className="hidden sm:block">
                  <Button size="sm" variant="outline" className="gap-1.5 px-2.5">
                    <Shield className="h-4 w-4" />
                    <span className="hidden lg:inline">Админ</span>
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden max-w-[100px] truncate text-sm text-slate-700 lg:inline dark:text-slate-300">
                      {user.name}
                    </span>
                    <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:inline" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="gap-2">
                      <User className="h-4 w-4" />
                      Профил
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/create" className="gap-2 sm:hidden">
                      <Plus className="h-4 w-4" />
                      Създай
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === "ADMIN" || user.role === "SUPPORT") && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="gap-2 sm:hidden">
                        <Shield className="h-4 w-4" />
                        Админ
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="gap-2 text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4" />
                    Изход
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {!loading && !user && (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost" className="text-slate-600">
                  Вход
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" style={{ backgroundColor: brandColor }}>
                  Регистрация
                </Button>
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800"
            aria-label={mobileOpen ? "Затвори меню" : "Отвори меню"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Desktop nav row */}
      <div className="hidden border-t border-slate-100 md:block dark:border-slate-800/60">
        <div className="mx-auto flex h-10 max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleNav.map((item) => (
            <NavLink key={item.href} item={item} active={isNavActive(pathname, item.href)} />
          ))}
          {overflowNav.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    overflowNav.some((i) => isNavActive(pathname, i.href))
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900",
                  )}
                >
                  Още
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {overflowNav.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={cn(isNavActive(pathname, item.href) && "font-semibold text-indigo-600")}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="border-t border-slate-100 px-4 py-4 md:hidden dark:border-slate-800">
          <SiteSearch className="mb-4" />
          <nav className="flex flex-col gap-0.5">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isNavActive(pathname, item.href)}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </nav>
          {user && (
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Link href="/create" onClick={() => setMobileOpen(false)}>
                <Button className="w-full gap-2" style={{ backgroundColor: brandColor }}>
                  <Plus className="h-4 w-4" />
                  Създай
                </Button>
              </Link>
              {(user.role === "ADMIN" || user.role === "SUPPORT") && (
                <Link href="/admin" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full gap-2">
                    <Shield className="h-4 w-4" />
                    Админ панел
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
