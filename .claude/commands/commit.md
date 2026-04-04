# /commit

Stage all changes, write a conventional commit message, and push to the current branch.

## Steps

1. Run `git status` to see what has changed.
2. Run `git diff --staged` and `git diff` to understand the full diff.
3. Run `git log --oneline -5` to see the recent commit style for this repo.
4. Stage all relevant changed files with `git add` (be specific — avoid `git add .` to prevent accidentally staging secrets or build artifacts).
5. Draft a commit message following [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` — new feature
   - `fix:` — bug fix
   - `docs:` — documentation only
   - `refactor:` — code change that isn't a fix or feature
   - `chore:` — dependency updates, config changes
   - Keep the subject line under 72 characters
   - Add a body if the change needs more context
6. Create the commit.
7. Push to the current branch with `git push -u origin <branch-name>`.
8. Report the commit hash and pushed branch.

## Arguments

Optional: `$ARGUMENTS` — if provided, use this as the commit message instead of generating one.
