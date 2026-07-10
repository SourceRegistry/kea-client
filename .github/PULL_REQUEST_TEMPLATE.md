## Summary

<!-- What does this PR change, and why? -->

## Related issue

<!-- Closes #... -->

## Checklist

- [ ] PR title follows [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, ...) — it becomes the squash-merge commit message and drives the next release.
- [ ] Added/updated types in `src/types.ts` for any new or changed Kea command.
- [ ] Added/updated a method on the relevant resource class in `src/client.ts`.
- [ ] Added a test case in `src/client.test.ts`.
- [ ] Updated `README.md`'s API table if a method was added or renamed.
- [ ] Added an example in `/examples` if this introduces a new command group.
- [ ] `npm test` and `npm run build` pass locally.
