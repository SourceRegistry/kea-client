# Contributing

Thanks for considering a contribution to `kea-client`.

## Reporting issues

Search [existing issues](https://github.com/SourceRegistry/kea-client/issues) before opening a new one. Use the appropriate issue template (bug report or feature request) and include:

- The Kea version and hook libraries involved (if relevant).
- A minimal reproduction (command sent, expected vs. actual response).
- The client version (`@sourceregistry/kea-client` version from `package.json`).

## Development setup

```sh
npm install
npm test              # vitest run
npm run build          # tsc + vite build
```

There is no separate lint step — `tsc --strict` (run as part of `build`, and via your editor's TS server) is the code-quality gate. Keep changes covered by tests in `src/client.test.ts`.

## Making changes

1. Fork the repo and create a branch off `main`.
2. Make your change. If you're adding a new Kea command, add:
   - Its argument/result types to `src/types.ts`.
   - A method on the relevant resource class in `src/client.ts`, following the existing `get*`/`set*`/`update*`/`del*`/`list*` naming convention.
   - A test case in `src/client.test.ts` asserting the command name and argument shape.
   - If it's a new command group worth demonstrating, an example in `/examples`.
3. Update `README.md`'s API table if you added or renamed a method.
4. Run `npm test` and `npm run build` locally before opening a PR.

## Commit messages and PR titles

This project releases automatically via [semantic-release](https://github.com/semantic-release/semantic-release): every push to `main` is analyzed, and commits that don't follow [Conventional Commits](https://www.conventionalcommits.org/) simply don't trigger a release — silently, with no error. So **PR titles must follow Conventional Commits**, since PRs are squash-merged and the PR title becomes the merge commit message:

```
<type>(<optional scope>): <description>

feat: add support for lease6-bulk-apply
fix: correct KeaApiError.service on multi-target commands
docs: document HA maintenance mode example
chore: bump devDependencies
```

Common types: `feat` (minor release), `fix` (patch release), `docs`, `chore`, `refactor`, `test`, `ci`. A `BREAKING CHANGE:` footer (or `!` after the type/scope) triggers a major release.

A GitHub Action (`.github/workflows/pr-title-lint.yml`) checks this automatically on every PR and will fail the check if the title doesn't conform — fix the title (edits are re-checked live) rather than the commits themselves.

## Pull requests

Use the PR template checklist. Keep PRs focused — one command group or fix per PR is easier to review than a broad sweep. CI (`test`, `build`) must pass before merge; the `release` and `deploy-docs` jobs only run on `main` after merge.
