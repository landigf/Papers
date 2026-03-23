import { ActionButton, SectionCard } from "@papers/ui"
import { demoSignInAction, demoSignUpAction, signOutDemoAction } from "../app/actions"

export function SignInForm() {
  return (
    <SectionCard eyebrow="Access" title="Sign in">
      <form action={demoSignInAction} className="stacked-form">
        <label>
          Handle or email
          <input name="identifier" placeholder="landigf or gennaro@papers.dev" required />
        </label>
        <ActionButton type="submit">Enter Papers</ActionButton>
      </form>
    </SectionCard>
  )
}

export function SignUpForm() {
  return (
    <SectionCard eyebrow="Join" title="Create an account">
      <form action={demoSignUpAction} className="stacked-form">
        <label>
          Name
          <input name="name" placeholder="Gennaro Landi" required />
        </label>
        <label>
          Email
          <input name="email" placeholder="gennaro@research.dev" required type="email" />
        </label>
        <label>
          Handle
          <input name="handle" placeholder="landigf" required />
        </label>
        <ActionButton type="submit">Create account</ActionButton>
      </form>
    </SectionCard>
  )
}

export function SignOutButton() {
  return (
    <form action={signOutDemoAction}>
      <ActionButton type="submit">Sign out</ActionButton>
    </form>
  )
}
