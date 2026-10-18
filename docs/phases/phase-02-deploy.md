# Phase 2: Deploy early

**Goal:** `https://holmanalv.github.io` serves the 4 pages. Every push to `develop` is built and checked without publishing anything, and every push to `master` deploys automatically.

**You will learn:**
- static hosting
- GitHub Pages site types
- what CI/CD is
- how a GitHub Actions workflow is built
- running a job only on one branch (`if:`)
- a two-branch flow: `develop` for work, `master` for production
- why you deploy a skeleton

**Before you start:**
- Phase 1 is done, and `npm run build` passes (including `astro check`).
- The experiments in `src/pages/projects/` (`glud.md`, `chat_at.astro`) and the `src/content/posts/` folder are deleted. Everything in `src/pages/` gets published, and Phase 7.5 builds the real project pages.

**Files you will touch:**
- `.github/workflows/deploy.yml` (new)
- your GitHub repository settings
- your local git remote
- a new `develop` branch

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

**`deploy` only runs if `build` succeeds.** A broken build never reaches the live site: the last good version stays online.

### 4. Two branches: `develop` and `master`

| Branch | What it is | A push to it… |
|---|---|---|
| `master` | Production: exactly what's live | builds **and deploys** |
| `develop` | Where you work every day | **only builds**, as a check. Nothing is published. |

When something on `develop` is ready, you **merge `develop` into `master`** and push `master`. That push is what publishes. The decision to publish is always yours.

One workflow file handles both branches:
- `on` lists both branches, so a push to either one starts a run.
- The `deploy` job gets a condition, **`if: github.ref == 'refs/heads/master'`**. `github.ref` is the full name of what triggered the run, and branches are written `refs/heads/<name>`. On `develop` the condition is false, so `deploy` shows as **skipped**.

**Why there's no automatic merge from `develop` to `master`:**
- **It wouldn't add safety.** The automatic merge would wait for the same build that already guards the deploy. What the build can't catch, like broken CSS or a wrong text, would slip through both ways. What catches those is you looking at the site before publishing.
- **It needs workarounds.** Actions done with a workflow's default token (`GITHUB_TOKEN`) don't start other workflows. A merge made by a workflow wouldn't trigger the deploy without a personal access token stored as a secret, which expires and needs maintenance.

For one person, a manual merge is one action, and it's the moment you decide "this is ready".

### 5. Why deploy now, with an almost empty site

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
3. **Change the branches:** the example triggers on `main`, and your branches are **`master`** and **`develop`**. Edit `branches: [ main ]` to `branches: [ master, develop ]`. *If you leave `main`, the workflow never runs and nothing tells you why.*
4. **Deploy only from `master`:** in the `deploy` job, next to `needs: build`, add `if: github.ref == 'refs/heads/master'` (concept 4).
5. Leave the commented `with:` options commented:
   - `path`: your project is at the repo root
   - `node-version`: the action's default (24) satisfies the `>=22.12.0` in your `package.json`
   - `package-manager`: detected from `package-lock.json`
6. Read the file once, top to bottom, and find in it each part from concepts 3 and 4: `on` with both branches, `permissions`, the `build` job, and the `deploy` job with its `needs` and its `if`.

### Check
- The file is at exactly `.github/workflows/deploy.yml` (the folder name starts with a dot).
- It triggers on `master` and `develop`.
- The `deploy` job has the `if` with the full `refs/heads/master`.

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
2. `/dev/`, `/gamedev/` and `/art/` work.
3. **Without** the trailing slash too: `/dev` redirects to `/dev/`.
4. *View page source* on a subpage: the canonical link is `https://holmanalv.github.io/dev/`.
5. A made-up path like `/nope` shows GitHub's default 404. Your own 404 page comes in Phase 11.
6. Header links, the active state and Contact all behave as they did locally.

---

## Step 6: Create `develop` and test the safety net

### What
Create the work branch, then prove that a push to it checks the build without publishing, even when the build breaks.

### Why
Same lesson as `astro check` in Phase 1: you trust the safety net after you've seen it catch something.

### Do it
1. Create a branch named `develop` **from `master`**, and publish it to GitHub.
2. **A good push:** on `develop`, change something visible (the `<h1>` placeholder of a page, for example), commit and push.
   - In the Actions tab, the run shows `build` green and `deploy` **skipped**.
   - The live site **doesn't** show the change.
3. **A broken push:** on `develop`, delete the `description` from one page, commit and push.
   - The run is red: `build` fails at `astro check`, and the log names the missing prop.
   - The live site is untouched.
4. Restore the `description`, commit and push. The run is green again.

### Check
- `develop` exists on GitHub.
- A push to `develop` never changes the live site, whether the build passes or fails.

---

## From now on

1. **Work on `develop`.** Commit and push as often as you like: each push is checked, and nothing is published. A red X means you fix it on `develop`. Production is never affected.
2. **When something is ready** (a finished phase, or a change you want live):
   1. the last run on `develop` is green
   2. you checked it locally with `npm run build && npm run preview`, which is the visual check no CI can do for you
3. **Publish:** merge `develop` into `master` and push `master`. That run builds and deploys.
4. **Go back to `develop`** to keep working.
5. **Never commit directly on `master`.** It only receives merges from `develop`, so `develop` always contains everything that's live. If you ever do commit on `master`, merge `master` back into `develop` right after.
6. **If something ugly goes live:**
   - the usual fix: correct it on `develop` and publish again, a few minutes in total
   - an emergency undo: in the Actions tab, open the last good run on `master` and click **Re-run all jobs**. A re-run builds the same commit it built originally, so the previous version goes back online. Your next publish replaces it.
7. **To deploy without new commits** (for example to update the footer year), the workflow has `workflow_dispatch`, which adds a **Run workflow** button in the Actions tab. Run it on `master`. On `develop` it only builds.

---

## Common pitfalls

- **The workflow is set to `main` while your branch is `master`:** nothing runs, silently.
- **`if: github.ref == 'master'`**, without `refs/heads/`: the condition is never true, so `deploy` is skipped on `master` too, silently.
- **No `if` on the `deploy` job:** a push to `develop` tries to publish. GitHub's `github-pages` environment normally lets only the default branch deploy, so the run fails with a protection-rules error. It's the `if` that keeps `develop` from ever publishing.
- **Commits made directly on `master`:** `develop` falls behind, and the next merge can conflict. Merge `master` back into `develop`.
- **The Pages source is left on "Deploy from a branch":** GitHub serves the raw repo (your README) instead of the site.
- **A typo in the repo name** (`HolmanAlv.github.com`, a missing dot…): the site ends up at a sub-path, or isn't served at all.
- **Testing in a cached tab:** after a deploy, hard-reload with `Ctrl+Shift+R`.
- **Case in file names:** `Header.astro` and `header.astro` are different files on Linux, which is what the Actions runner uses. Keep imports matching the real case.

---

## Done when

- [ ] The repo is named `HolmanAlv.github.io`, and `git remote -v` shows it.
- [ ] `.github/workflows/deploy.yml` exists, triggers on `master` and `develop`, and deploys only from `master`.
- [ ] Pages' source is GitHub Actions.
- [ ] The first run on `master` is green.
- [ ] All 4 URLs work live, with and without the trailing slash.
- [ ] `develop` exists. A push to it runs `build`, skips `deploy`, and a broken build there leaves the live site untouched.
- [ ] Phase 2 is checked off in `docs/PLAN.md`.

---

## References

- [Astro: deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub: types of GitHub Pages sites](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#types-of-github-pages-sites)
- [GitHub: renaming a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)
- [GitHub Actions: workflow syntax](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions) (`on`, `jobs.<job_id>.if`)
- [GitHub Actions: the `github` context](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/accessing-contextual-information-about-workflow-runs#github-context) (`github.ref`)
- [GitHub Actions: re-running workflows](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/re-running-workflows-and-jobs)

## Concepts recap

| Concept | One line |
|---|---|
| Static hosting | `dist/` is just files, so any file server works. |
| User site | The repo named `<user>.github.io` is served at the root, with no `base`. |
| CI | Every push is built and checked on a clean machine. |
| CD | A green build is published automatically. |
| Workflow parts | Trigger (`on`), `permissions`, and `jobs` (build → artifact → deploy). |
| `develop` / `master` | Push to `develop` to check, and merge into `master` to publish. |
| `if: github.ref == 'refs/heads/master'` | The deploy job runs only for `master`. |
| Re-run | Rebuilds the same commit, which makes it an emergency undo. |
| Deploy early | Production-only bugs show up one at a time, next to the change that caused them. |
