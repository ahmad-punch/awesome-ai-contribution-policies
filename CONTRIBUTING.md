# Contributing

Corrections and new entries are welcome. The bar is a primary source: a CONTRIBUTING file, AGENTS.md, PR template, governance vote or an official blog post. Press coverage is acceptable only when no primary source exists, and the entry should say so in `notes`.

## Add or update an entry

1. Edit `policies.json`. Keep entries sorted by `project` (case-insensitive); the validator tells you where an entry belongs.
2. Run `npm install` once, then `npm run validate && npm run build`.
3. Commit `policies.json` and the regenerated `README.md` together. Never edit README.md by hand.

If you would rather not edit JSON, open a [new policy](.github/ISSUE_TEMPLATE/new-policy.yml) or [policy change](.github/ISSUE_TEMPLATE/policy-change.yml) issue.

## Entry template

```json
{
  "project": "Example Project",
  "repo": "example-org/example",
  "ecosystem": "python",
  "stance": "disclose-required",
  "agents_allowed": "supervised",
  "disclosure_format": "Assisted-by: commit trailer",
  "co_author_trailer_for_ai": "unspecified",
  "gates": ["assigned to an approved issue"],
  "pr_creation_policy": "all",
  "sanctions": ["PR closed"],
  "quote": "Copy the most load-bearing sentence of the policy, 300 characters or fewer.",
  "quote_kind": "verbatim",
  "source_url": "https://github.com/example-org/example/blob/main/AI_POLICY.md",
  "policy_date": "2026-09",
  "last_verified": "2026-10-21",
  "notes": "Anything a contributor should know that the fields do not capture."
}
```

## Field guide

- **repo**: `owner/name` on GitHub; `host/path` for other forges (`gitlab.freedesktop.org/mesa/mesa`); an org name for organisation-wide policies. It is the unique key.
- **stance**: `ban` refuses AI-generated code; `restricted` allows AI only in limited roles or forbids agents; `disclose-required` and `disclose-encouraged` are about declaring use; `neutral` means the project addresses AI only through accountability or process rules; `encouraged` actively welcomes it; `no-policy` means nothing was found.
- **agents_allowed**: `supervised` means agent output is accepted only with a human who reviews, tests and answers for it.
- **quote_kind**: `verbatim` only if the quote is copied exactly. Otherwise `summary`.
- **last_verified**: the date you read the source, not the date of the policy.
