import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import type { RiskSeverity } from "../lib/mock-data";

export function PageHeader({
  actions,
  description,
  eyebrow,
  title
}: {
  actions?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <header className="page-header">
      <div>
        <p className="page-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

export function MetricCard({
  change,
  changeTone,
  label,
  note,
  value
}: {
  change: string;
  changeTone: "down" | "flat" | "up";
  label: string;
  note: string;
  value: string;
}) {
  const TrendIcon =
    changeTone === "up" ? ArrowUpRight : changeTone === "down" ? ArrowDownRight : Minus;

  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <div className={`metric-change change-${changeTone}`}>
        <TrendIcon aria-hidden="true" size={14} />
        <span>{change}</span>
        <small>{note}</small>
      </div>
    </article>
  );
}

export function Panel({
  action,
  children,
  description,
  title
}: {
  action?: ReactNode;
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action ? <div className="panel-action">{action}</div> : null}
      </header>
      {children}
    </section>
  );
}

export function RiskBadge({ severity }: { severity: RiskSeverity }) {
  return <span className={`risk-badge risk-${severity}`}>{severity}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-badge status-${normalized}`}>{status}</span>;
}

export function FilterBar({
  children,
  searchPlaceholder
}: {
  children?: ReactNode;
  searchPlaceholder: string;
}) {
  return (
    <div className="filter-bar">
      <input aria-label={searchPlaceholder} placeholder={searchPlaceholder} type="search" />
      {children}
    </div>
  );
}
