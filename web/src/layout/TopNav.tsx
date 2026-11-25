"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isMockApi } from "@/lib/env";
import { cn } from "@/lib/utils";
import MockBadge from "@/shared/component/MockBadge";
import { NAV_ITEMS, ROUTES, SITE } from "@/shared/constant/routes";

const aktif = (pathname: string, href: string) =>
  href === ROUTES.DEMO ? pathname === href : pathname.startsWith(href);

const TopNav = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-rule border-b bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="page-container flex h-14 items-center justify-between gap-4">
        <Link
          href={ROUTES.DEMO}
          className="flex items-baseline gap-2 rounded-md"
          aria-label={`${SITE.name}, ke halaman demo`}
        >
          <span className="font-heading font-semibold text-lg leading-none">
            {SITE.name}
          </span>
          <span className="label-caps hidden sm:inline">PCD · Viskom</span>
        </Link>

        <div className="flex items-center gap-3">
          {isMockApi() ? <MockBadge /> : null}
          <nav aria-label="Navigasi utama">
            <ul className="flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => {
                const isAktif = aktif(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={item.description}
                      aria-current={isAktif ? "page" : undefined}
                      className={cn(
                        "relative inline-flex h-9 items-center rounded-md px-3 text-sm transition-colors duration-150",
                        isAktif
                          ? "font-medium text-ink after:absolute after:inset-x-3 after:-bottom-[9px] after:h-0.5 after:bg-brand"
                          : "text-ink-muted hover:bg-paper-sunken hover:text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
