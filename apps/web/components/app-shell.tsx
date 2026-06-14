"use client";

import {
  Bell,
  Building2,
  ChevronDown,
  CircleGauge,
  FileBarChart,
  Landmark,
  Network,
  Play,
  Search,
  Settings,
  ShieldCheck,
  WalletCards
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/", icon: CircleGauge, label: "Dashboard" },
  { href: "/demo", icon: Play, label: "Demo flow" },
  { href: "/portfolio", icon: WalletCards, label: "Portfolio" },
  { href: "/entities", icon: Building2, label: "Counterparties" },
  { href: "/ncd-exposures", icon: Landmark, label: "NCD exposures" },
  { href: "/alerts", icon: Bell, label: "Alerts", count: 12 },
  { href: "/relationships", icon: Network, label: "Relationships" },
  { href: "/reports", icon: FileBarChart, label: "Reports" }
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <ShieldCheck aria-hidden="true" size={20} />
          </span>
          <span>
            <strong>RIVR</strong>
            <small>Risk intelligence</small>
          </span>
        </div>

        <nav aria-label="Primary navigation" className="primary-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className={isActive(pathname, item.href) ? "nav-link active" : "nav-link"}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                <span>{item.label}</span>
                {"count" in item ? <span className="nav-count">{item.count}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link className="nav-link" href="/settings">
            <Settings aria-hidden="true" size={17} strokeWidth={1.8} />
            <span>Settings</span>
          </Link>
          <div className="workspace-card">
            <span className="avatar avatar-company">AD</span>
            <span>
              <strong>Artha Debt Fund</strong>
              <small>Enterprise workspace</small>
            </span>
            <ChevronDown aria-hidden="true" size={15} />
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">
              <ShieldCheck aria-hidden="true" size={18} />
            </span>
            <strong>RIVR</strong>
          </div>
          <label className="global-search">
            <Search aria-hidden="true" size={16} />
            <span className="sr-only">Search portfolio</span>
            <input
              aria-label="Search issuers, ISIN, GSTIN or CIN"
              placeholder="Search issuer, ISIN, GSTIN, CIN..."
              type="search"
            />
            <kbd>⌘ K</kbd>
          </label>
          <div className="topbar-actions">
            <button aria-label="Notifications" className="icon-button" type="button">
              <Bell aria-hidden="true" size={18} />
              <span className="notification-dot" />
            </button>
            <button className="user-menu" type="button">
              <span className="avatar">BK</span>
              <span className="user-copy">
                <strong>B. Kumar</strong>
                <small>Credit manager</small>
              </span>
              <ChevronDown aria-hidden="true" size={14} />
            </button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
