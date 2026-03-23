# Security

Papers is built for research sharing, so privacy boundaries matter early.

## Current Security Defaults

- account required for any publication
- blind mode is per-post, not anonymous account creation
- public serialization removes author identity from blind posts
- blind posts are excluded from external AI provider submission
- private drafts and moderation notes are excluded from external AI provider submission
- uploads must be rewritten or scrubbed before blind-mode persistence

## Secrets

- keep all secrets in local env or a secret manager
- never commit keys
- never expose provider keys to the browser

## Vulnerability Reporting

Open a private report through GitHub security advisories or contact the maintainer directly before publishing exploit details.
