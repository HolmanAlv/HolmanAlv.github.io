# Phase 2: Deploy early

**Goal:** `https://holmanalv.github.io` serves the 4 pages, and every push to `master` deploys automatically.

**You will learn:**
- static hosting
- GitHub Pages site types
- what CI/CD is
- how a GitHub Actions workflow is built
- why you deploy a skeleton

**Before you start:** Phase 1 is done, and `npm run build` passes (including `astro check`).

**Files you will touch:**
- `.github/workflows/deploy.yml` (new)
- your GitHub repository settings
- your local git remote

**Out of scope:** a custom domain and a custom 404 page (Phase 11).

> You do the commits and pushes yourself, in GitHub Desktop Plus. This guide tells you *when* to push, never how.

---

## Concepts

### 1. Static hosting

After `npm run build`, `dist/` is a folder of HTML, CSS, images and maybe some JS. **Any server that can hand out files can host it.** No Node, no database, nothing running per request. That makes it:
- fast (files can be cached at the edge)
- cheap (GitHub Pages is free)
- hard to break (there's no server code to attack)

### 2. GitHub Pages: user site or project site

| Repo name | Site URL | Needs `base`? |
|---|---|---|
| `HolmanAlv.github.io` (the special name) | `https://holmanalv.github.io/` | No |
| Any other name, like `Holman-Portfolio` | `https://holmanalv.github.io/Holman-Portfolio/` | Yes |

Each account gets **one** user site, and the repo has to be named exactly `<username>.github.io`. That's why you're renaming the repo.

### 3. CI/CD and GitHub Actions

- **CI (continuous integration):** every push is built and checked on a clean machine. "It works on my laptop" stops being enough. Your `build` script now includes `astro check`, so a type error fails the deploy instead of shipping.
- **CD (continuous deployment):** if the build passes, the result is published automatically.

A **workflow** is a YAML file in `.github/workflows/`. Its parts:
- **`on`:** what triggers it (a push to a branch, or a manual click).
- **`permissions`:** what the workflow's token may do. Deploying to Pages needs `pages: write` and `id-token: write`. The second one lets GitHub verify that the deployment really comes from this workflow.
- **`jobs`:** the units of work. Here there are two:
  1. **`build`** checks out the code. Then Astro's official action installs dependencies (it picks npm because you committed `package-lock.json`), runs your `build` script and uploads `dist/` as an *artifact*.
  2. **`deploy`** waits for `build` (`needs: build`) and publishes that artifact to Pages.

### 4. Why deploy now, with an almost empty site

Some bugs only exist in production: paths, trailing slashes, case-sensitive file names (your Linux machine is case-sensitive too, but Windows and macOS users aren't), missing files that only worked from your cache. If you deploy on the last day, they all appear at once. If you deploy now, **each phase is tested live as you finish it**, and when something breaks you know it's whatever you just changed.

---

## Step 1: Rename the repository

### What
Rename the GitHub repo from `Holman-Portfolio` to `HolmanAlv.github.io`.

### Why
That's the special name that makes GitHub serve the site at the root URL with no `base`, which is what the config from Phase 0 assumes.

### Do it
1. **Check for a collision:** if you already have a repo named `HolmanAlv.github.io` (maybe an old experiment), rename or delete that one first. Two repos can't share a name.
2. On GitHub, open the repo → **Settings** → **General** → **Repository name**. Type `HolmanAlv.github.io` and click **Rename**.
3. GitHub redirects the old URLs to the new name, so nothing breaks right away. Still, update your local copy to point at the new URL:
   - in GitHub Desktop Plus, check that the repository's remote shows the new name, and update it if it doesn't
   - or from a terminal in the repo: `git remote set-url origin <new URL>` (copy the new URL from the green **Code** button on GitHub)
4. Confirm it with:
   ```sh
   git remote -v
   ```

### Check
`git remote -v` shows `.../HolmanAlv.github.io.git` for both fetch and push.

---

## Step 2: The workflow file

### What
Create `.github/workflows/deploy.yml` with Astro's official GitHub Pages workflow.

### Why
It's the deployment method Astro maintains, and it needs almost no configuration. Copy it from the docs instead of from an old tutorial, so the action versions are current.

### Do it
1. Create the folders `.github/workflows/` at the project root.
2. Open the official guide ([Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)) and copy the workflow from the **How to deploy** section into `.github/workflows/deploy.yml`.
3. **Change the branch:** the example triggers on `main`, and your branch is **`master`**. Edit `branches: [ main ]` to `branches: [ master ]`. *If you skip this, the workflow never runs and nothing tells you why.*
4. Leave the commented `with:` options commented:
   - `path`: your project is at the repo root
   - `node-version`: the action's default (24) satisfies the `>=22.12.0` in your `package.json`
   - `package-manager`: detected from `package-lock.json`
5. Read the file once, top to bottom, and find in it each part from concept 3: `on`, `permissions`, the `build` job and the `deploy` job with its `needs`.

### Check
- The file is at exactly `.github/workflows/deploy.yml` (the folder name starts with a dot).
- It triggers on `master`.

---

## Step 3: Tell GitHub Pages to use Actions

### What
Switch the Pages source to "GitHub Actions".

### Why
By default, Pages publishes files straight from a branch and runs Jekyll on them. Here you want it to publish the artifact your workflow builds.

### Do it
1. Go to the repo → **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, choose **GitHub Actions**.

### Check
The Pages settings show "GitHub Actions" as the source.

---

## Step 4: Push and watch it deploy

### What
Commit the Phase 0–2 work and push it to `master`.

### Why
The push is the trigger. Watching the first run teaches you where to look when a future deploy fails.

### Do it
1. Commit and push from GitHub Desktop Plus.
2. On GitHub, open the **Actions** tab. A run named after the workflow appears. Click it to watch both jobs.
3. If a job fails, click it and open the failed step. The log shows the exact error, usually the same one `npm run build` would show you locally.
4. The first deployment can take a couple of minutes to become reachable.

### Check
Both jobs are green, and the `deploy` job shows the site URL.

---

## Step 5: Verify the live site

### Do it and check
1. `https://holmanalv.github.io/` shows the Home page.
2. `/developer/`, `/gamedev/` and `/filmmaker/` work.
3. **Without** the trailing slash too: `/developer` redirects to `/developer/`.
4. *View page source* on a subpage: the canonical link is `https://holmanalv.github.io/developer/`.
5. A made-up path like `/nope` shows GitHub's default 404. Your own 404 page comes in Phase 11.
6. Header links, the active state, the skip link and Contact all behave as they did locally.

---

## From now on

- **Every push to `master` publishes.** If you don't want work in progress to go public, work on a branch and merge it into `master` when a phase is done. For a portfolio under construction it's also fine to publish as you go.
- **A red X in the Actions tab means production didn't change.** The last good version stays online, so a failed build never takes your site down.
- **To deploy without new commits** (for example to update the footer year), the workflow has `workflow_dispatch`, which adds a **Run workflow** button in the Actions tab.

---

## Common pitfalls

- **The workflow is set to `main` while your branch is `master`:** nothing runs, silently.
- **The Pages source is left on "Deploy from a branch":** GitHub serves the raw repo (your README) instead of the site.
- **A typo in the repo name** (`HolmanAlv.github.com`, a missing dot…): the site ends up at a sub-path, or isn't served at all.
- **Testing in a cached tab:** after a deploy, hard-reload with `Ctrl+Shift+R`.
- **Case in file names:** `Header.astro` and `header.astro` are different files on Linux, which is what the Actions runner uses. Keep imports matching the real case.

---

## Done when

- [ ] The repo is named `HolmanAlv.github.io`, and `git remote -v` shows it.
- [ ] `.github/workflows/deploy.yml` exists and triggers on `master`.
- [ ] Pages' source is GitHub Actions.
- [ ] The first run is green.
- [ ] All 4 URLs work live, with and without the trailing slash.
- [ ] Phase 2 is checked off in `docs/PLAN.md`.

---

## References

- [Astro: deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub: types of GitHub Pages sites](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#types-of-github-pages-sites)
- [GitHub: renaming a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)
- [GitHub Actions: workflow syntax](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)

## Concepts recap

| Concept | One line |
|---|---|
| Static hosting | `dist/` is just files, so any file server works. |
| User site | The repo named `<user>.github.io` is served at the root, with no `base`. |
| CI | Every push is built and checked on a clean machine. |
| CD | A green build is published automatically. |
| Workflow parts | Trigger (`on`), `permissions`, and `jobs` (build → artifact → deploy). |
| Deploy early | Production-only bugs show up one at a time, next to the change that caused them. |
