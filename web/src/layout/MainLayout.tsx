import type React from "react";
import SiteFooter from "./SiteFooter";
import TopNav from "./TopNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => (
  <div className="flex min-h-dvh flex-col">
    <a
      href="#konten"
      className="sr-only rounded-md bg-ink px-3 py-2 text-ink-inverse text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
    >
      Lompat ke konten
    </a>
    <TopNav />
    <main id="konten" className="flex-1">
      {children}
    </main>
    <SiteFooter />
  </div>
);

export default MainLayout;
