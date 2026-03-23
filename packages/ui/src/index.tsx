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
