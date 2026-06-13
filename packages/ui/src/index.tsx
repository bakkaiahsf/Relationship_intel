import type { AnchorHTMLAttributes, PropsWithChildren } from "react";

type ButtonLinkProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: "primary" | "secondary";
  }
>;

export function ButtonLink({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  const variantClass = variant === "secondary" ? "button-secondary" : "";
  return (
    <a className={`button ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </a>
  );
}

export function FeatureCard({
  children,
  title
}: PropsWithChildren<{ title: string }>) {
  return (
    <article className="card">
      <h2>{title}</h2>
      <p>{children}</p>
    </article>
  );
}
