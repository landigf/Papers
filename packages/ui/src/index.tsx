import type { PropsWithChildren } from "react"

export function AppShell({ children }: PropsWithChildren) {
  return <div className="app-shell">{children}</div>
}

export function SectionCard({
  title,
  eyebrow,
  children,
}: PropsWithChildren<{ title: string; eyebrow?: string }>) {
  return (
    <section className="section-card">
      {eyebrow ? <div className="section-eyebrow">{eyebrow}</div> : null}
      <h2>{title}</h2>
      <div className="section-content">{children}</div>
    </section>
  )
}

export function Pill({ children }: PropsWithChildren) {
  return <span className="pill">{children}</span>
}

export function ActionButton({
  children,
  type = "button",
}: PropsWithChildren<{ type?: "button" | "submit" }>) {
  return (
    <button className="action-button" type={type}>
      {children}
    </button>
  )
}

/** LinkedIn-style avatar with initials fallback */
export function Avatar({
  name,
  size = "md",
}: {
  name: string
  size?: "sm" | "md" | "lg"
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const sizeClass = size === "sm" ? "avatar-sm" : size === "lg" ? "avatar-lg" : ""
  return <div className={`avatar ${sizeClass}`}>{initials}</div>
}

/** GitHub-style stat badge */
export function StatBadge({
  icon,
  value,
  accent,
}: {
  icon: string
  value: number | string
  accent?: boolean
}) {
  return (
    <span className={`stat-badge ${accent ? "stat-badge-accent" : ""}`}>
      {icon} {value}
    </span>
  )
}
