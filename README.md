# Automation Testing — plain HTML, CSS, and JavaScript

This independent copy keeps the existing website layout and the Session 1 note formatting. The active site has no Astro, Starlight runtime, React, TypeScript, package dependencies, or build step. Existing static styling has been retained so the design stays consistent.

`astro-project-backup/` is a complete snapshot of the original project, including its source, configuration, dependencies, and generated files. It is a backup, not part of the website. The original sibling project is unchanged. The local server deliberately does not serve this backup or the `reference/` verification directory.

## Run locally

From this folder, run:

```sh
node server.mjs
```

Or use `npm start`. No `npm install` is needed. Open http://127.0.0.1:5181/. The original Astro website keeps port 5180. Search reads local HTML pages, so use this local server or an editor's static server instead of opening the files with `file://`.

## Edit manually

- Homepage: `index.html`.
- Session 1: `bdd-framework/session-1-bdd-cucumber-gherkin/index.html`.
- Shared subjects and page registry: `assets/site-data.js`.
- Additional design changes: `assets/app.css`.
- Existing page layout: `assets/layout.css`.
- Preserved note styles: `assets/session-1.css`.
- Navigation, search, themes, and table of contents: `assets/app.js`.
- Quiz and code copying: `assets/session.js`.

Open the HTML file in VS Code or another text editor. Find the heading or sentence, edit its text, save, and refresh the browser. The note is indented into readable sections. Keep element classes when changing only content; those classes preserve formatting. Text such as `<` and `&` must use HTML escaping (`&lt;` and `&amp;`). Inside `<pre><code>`, preserve indentation and line breaks exactly.

The `data-astro-cid-*` attributes and the named layout wrapper elements are retained CSS hooks from the original visual design. They do not run Astro or require it to be installed. Removing them without updating the matching CSS would change the layout.

Search reads the current registered HTML pages each time the browser loads. Editing a note and refreshing is sufficient; there is no search-index build. The table of contents is generated from existing heading IDs. Give any new heading a unique `id`.

## Add a tutorial

1. Copy the existing tutorial HTML page into a new subject/topic folder as `index.html`.
2. Keep its document shell (header, sidebar, script/style links), but replace only the central note content with your supplied notes. For an ordinary new note, use a normal article with paragraphs, headings, and code blocks; the preserved Session 1 snapshot classes are only needed to reproduce that source's special formatting.
3. Set the document title, description, main heading, and heading IDs.
4. Add `{ title, url, subject, order }` to `pages` in `assets/site-data.js`. Use the subject ID from `subjects`. Navigation and search pick it up automatically.
5. Update the homepage's corresponding learning-path link/count when a new tutorial is available. Set Start Learning to `/typescript/introduction/` once those actual notes are provided.
6. Refresh and check the page, navigation, and search.

No new tutorial content has been invented. The reference JSON records the original shared note's text and 19 code blocks for comparison. Editing it does not edit the published note.

## Static hosting

Deploy the root HTML files, `assets/`, `images/`, `favicon.svg`, and tutorial directories to any static host at the website root. Exclude `astro-project-backup/`, `reference/`, the project requirement documents, and the local server from public deployment. Directory routes have real `index.html` files and work on direct refresh. Use `404.html` as the host's not-found page. No backend or build command is needed.

The public website is hosted on GitHub Pages at https://mygithub7777.github.io/automation-testing-notes/.

## Formatting maintenance note

Imported chat styles used `white-space: pre-line` on paragraphs and layout containers. With manually indented HTML, this renders editor line breaks as unwanted blank lines, including inside lists, tables, and code-block wrappers.

Keep the whitespace normalization rule at the end of `assets/app.css`. Ordinary teaching-note HTML must use normal whitespace; `pre` elements and everything inside them must retain their original whitespace. Use semantic paragraph/list elements, CSS margins or gaps, and explicit `<br>` only where a visible line break is intentional. Do not add blank HTML lines to control visual spacing. Do not remove code indentation or rewrite teaching content to fix a layout issue.

After formatting or editing an imported page, check the full page on desktop and mobile, including lists, tables, diagrams, and code examples. The original Astro project and its backup are separate and should not be changed for this plain HTML site's styling fixes.

## Published BDD sessions

- Session 1: `bdd-framework/session-1-bdd-cucumber-gherkin/index.html`.
- Session 2: `bdd-framework/session-2-playwright-bdd-setup/index.html`.
- Session 3: `bdd-framework/session-3-advanced-playwright-bdd/index.html`.

Each new session keeps its own presentation and interaction files under `assets/session-2.*` or `assets/session-3.*`. Original source text and code-block records are in `reference/session-2.source.json` and `reference/session-3.source.json`. All three sessions are registered in `assets/site-data.js`. Published sessions are available through the BDD Framework sidebar. Page spacing follows the documented normal-whitespace rule, preserving literal whitespace inside code blocks.


## Update the GitHub Pages website

After editing the HTML, CSS, or JavaScript, run `npm run build:pages`. This prepares the `docs/` publishing folder with repository-relative asset and navigation paths. Commit and push both the source edits and updated `docs/` to `main`. GitHub Pages automatically publishes `main` → `/docs`. Local development remains `npm start` on port 5181. No frontend framework or package installation is needed. Do not edit generated files in `docs/` directly.
