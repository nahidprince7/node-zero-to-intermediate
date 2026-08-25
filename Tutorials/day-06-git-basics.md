# Day 6 — Git Basics: Track Your Learning

> Core lesson: about 60 minutes. This lesson initializes Git locally; it does not publish anything online.

## Learning Objectives

You will learn to:

- explain repository, working tree, staging area, and commit;
- initialize a Git repository;
- inspect changes with `status` and `diff`;
- stage selected files with `add`;
- create meaningful commits;
- inspect history with `log`;
- avoid committing secrets and generated files.

## Prerequisites and Safety

Git records file changes; GitHub is an online hosting service. You can use Git without GitHub.

Do not run commands you do not understand. This lesson does not use `reset --hard`, forced pushes, or file-deleting Git commands.

Verify Git:

```bash
git --version
```

If Git is missing on Ubuntu/Debian:

```bash
sudo apt update
sudo apt install git
```

## 0–12 Minutes — The Git Mental Model

Git has three important places:

1. **Working tree:** files you are currently editing.
2. **Staging area:** changes selected for the next commit.
3. **Repository history:** saved commits.

The normal flow is:

```text
edit files → inspect → stage selected changes → commit
```

A commit is a named snapshot of staged changes, not an automatic backup of everything.

## 12–22 Minutes — Initialize the Repository

Move to the workspace and check whether Git already exists:

```bash
cd /home/nahid/Projects/Learning/app
git status
```

If Git says this is not a repository, initialize it:

```bash
git init
```

Now run:

```bash
git status
```

If Git asks for identity when you later commit, configure it for this repository only, using your real details:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
```

Confirm the local configuration:

```bash
git config --local --list
```

Do not copy the example identity unchanged.

## 22–32 Minutes — Ignore Files Deliberately

Some files should not enter Git: dependencies, secrets, logs, and build output.

Create the directory for today's notes:

```bash
mkdir -p practice/day-06
```

Create `.gitignore` in the workspace root using VS Code:

```text
node_modules/
.env
.env.*
!.env.example
dist/
coverage/
*.log
```

Save it and run:

```bash
git status
```

Never commit real passwords, API keys, database credentials, or JWT secrets. `.gitignore` helps prevent mistakes but does not remove a secret already committed.

## 32–45 Minutes — Inspect and Stage Changes

Create `practice/day-06/git-notes.md`:

```markdown
# Git Notes

- Working tree: files I am editing
- Staging area: changes selected for the next commit
- Commit: a saved snapshot with a message
```

Inspect status:

```bash
git status
```

Stage only this lesson's notes and `.gitignore`:

```bash
git add .gitignore
git add practice/day-06/git-notes.md
```

Check again:

```bash
git status
```

Files under “Changes to be committed” are staged. Other tutorial/practice files may remain untracked; that is okay.

Inspect staged changes:

```bash
git diff --staged
```

Plain `git diff` shows unstaged modifications to tracked files. `git diff --staged` shows what the next commit will contain.

## 45–53 Minutes — Create a Commit

Commit the staged files:

```bash
git commit -m "chore: start learning repository"
```

A useful commit message says what changed. Prefer:

```text
feat: add number classifier exercise
docs: add notes about JavaScript types
fix: correct grade boundary condition
```

Avoid vague messages like `update`, `stuff`, or `changes`.

Inspect the result:

```bash
git status
git log --oneline
```

`git status` should no longer list the committed files as changed. Other untracked files may still appear.

## 53–60 Minutes — Make a Second Commit

Add a new line to `git-notes.md`:

```markdown
- History: an ordered list of commits
```

Inspect, stage, and commit:

```bash
git diff
git add practice/day-06/git-notes.md
git diff --staged
git commit -m "docs: expand Git notes"
git log --oneline
```

You should now see two commits, newest first.

## Guided Practice — Commit One Learning Day

Choose one completed practice day. Inspect its files, then stage the directory explicitly:

```bash
git status
git add practice/day-05
git status
git diff --staged
```

Only commit after confirming the staged file list:

```bash
git commit -m "practice: complete arrays and objects exercises"
```

If Day 5 is not complete, choose a completed day or postpone this commit. Never label unfinished work complete.

## Independent Exercises

1. Explain the working tree, staging area, and commit in your own words inside `git-notes.md`.
2. Make a small intentional edit to a practice file. Compare `git diff` before staging and `git diff --staged` after staging.
3. Commit one logically complete learning change with a descriptive message.
4. Run `git log --oneline` and explain each visible commit.
5. Create `.env` containing only fake data such as `EXAMPLE_ONLY=true`. Confirm it does not appear in `git status`, then leave it ignored.

## Common Mistakes and Debugging

- `git add` stages; it does not commit.
- `git commit` records only staged changes.
- Always read `git status` before and after staging.
- Avoid `git add .` until you can explain every file it would stage.
- If commit identity is missing, set repository-local `user.name` and `user.email`.
- Never paste secrets into Git, even briefly.
- A clean working tree means tracked files match the latest commit; it does not mean every planned task is finished.

## Review Questions

1. How is Git different from GitHub?
2. What are the three places in Git's basic mental model?
3. What does `git init` do?
4. What does `git status` tell you?
5. How do `git diff` and `git diff --staged` differ?
6. What does `git add` do?
7. What makes a useful commit message?
8. Why must `.env` be ignored?

## Completion Checklist

- [ ] The workspace is a Git repository.
- [ ] `.gitignore` exists and ignores `.env` and `node_modules`.
- [ ] You created at least two focused commits.
- [ ] You inspected staged changes before committing.
- [ ] You can explain the Git mental model without notes.

## Next Blog Milestone

Daily commits will record every future blog milestone and make mistakes easier to understand and recover from.

## What to Send for Review

Send the output of `git status`, `git log --oneline`, your `.gitignore`, review answers, and any error. Do not send the contents of a real `.env`. Next: **Day 7 — Destructuring, Spread, and Rest**.
