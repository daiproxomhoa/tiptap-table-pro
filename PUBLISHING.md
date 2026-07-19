# Publishing `tiptap-table-pro` to npm

A complete, repeatable checklist for releasing this package.

## 0. One-time prerequisites

1. **Create an npm account** at <https://www.npmjs.com/signup> (skip if you have one).
2. **Verify your email** — npm blocks publishing from unverified accounts.
3. **Enable 2FA** (Account → Two-Factor Authentication). Recommended: set it to
   *Authorization and writes* so publishes require a one-time code.
4. Confirm the name is free:
   ```bash
   npm view tiptap-table-pro
   ```
   A `404` means the name is available. If it's taken, change `"name"` in
   `package.json` (e.g. a scoped name like `@yourorg/tiptap-table-pro`).

## 1. Log in from your terminal

```bash
npm login
# follow the browser / OTP prompt, then confirm:
npm whoami
```

## 2. Install and build

```bash
npm install
npm run build      # runs tsup → emits dist/ (ESM + CJS + .d.ts)
```

`npm run build` is also wired to `prepublishOnly`, so it runs automatically on
publish — but building manually first lets you inspect the output.

## 3. Sanity-check what will be shipped

Only `dist/` is published (controlled by the `"files"` field in `package.json`;
`package.json`, `README.md`, and `LICENSE` are always included).

```bash
npm pack --dry-run
```

Read the file list it prints. It should contain `dist/**`, `package.json`,
`README.md`, `LICENSE` — and **not** `src/`, `node_modules`, or tests.

Optionally create the real tarball to inspect:

```bash
npm pack           # writes tiptap-table-pro-0.1.0.tgz
tar -tzf tiptap-table-pro-*.tgz
```

## 4. Set the version

Follow [semver](https://semver.org). Never republish an existing version — npm
forbids it. Bump with the built-in command (this also creates a git commit +
tag):

```bash
npm version patch   # 0.1.0 -> 0.1.1  (bug fixes)
npm version minor   # 0.1.0 -> 0.2.0  (new features, backward compatible)
npm version major   # 0.1.0 -> 1.0.0  (breaking changes)
```

For the very first release you can leave it at `0.1.0` and skip this step.

## 5. Publish

Unscoped public package:

```bash
npm publish
```

Scoped package (e.g. `@yourorg/tiptap-table-pro`) — scoped packages are private
by default, so make it public:

```bash
npm publish --access public
```

(`"publishConfig": { "access": "public" }` is already set in `package.json`, so
`--access public` is optional here, but harmless.)

If 2FA is on, npm prompts for your one-time code.

### Publish a pre-release first (optional but recommended)

Test the install experience without affecting the `latest` tag:

```bash
npm version prerelease --preid=rc   # e.g. 0.1.1-rc.0
npm publish --tag next
# consumers opt in with:  npm install tiptap-table-pro@next
```

Promote it to `latest` when happy:

```bash
npm dist-tag add tiptap-table-pro@0.1.1 latest
```

## 6. Verify the release

```bash
npm view tiptap-table-pro
# in a throwaway folder:
npm install tiptap-table-pro
```

Check the page at `https://www.npmjs.com/package/tiptap-table-pro`.

## 7. Push the git tag

```bash
git push && git push --tags
```

## Fixing a bad publish

- **Within 72 hours** you may unpublish a specific version:
  ```bash
  npm unpublish tiptap-table-pro@0.1.0
  ```
  After 72 hours npm generally won't let you unpublish. Instead **deprecate**:
  ```bash
  npm deprecate tiptap-table-pro@0.1.0 "Broken build, use 0.1.1"
  ```

## Automating with GitHub Actions (optional)

Add an npm **Automation** access token (npmjs.com → Access Tokens → Generate →
*Automation*, which bypasses 2FA) to your repo secrets as `NPM_TOKEN`, then:

```yaml
# .github/workflows/publish.yml
name: publish
on:
  release:
    types: [published]
jobs:
  npm:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write        # enables npm provenance
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org
      - run: npm ci
      - run: npm run build
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

`--provenance` publishes a verifiable link between the package and the source
commit/workflow that built it — it shows up as a green badge on npm.

## Quick reference

```bash
npm login                 # authenticate
npm run build             # build dist/
npm pack --dry-run        # inspect contents
npm version patch|minor|major
npm publish --access public
git push --tags
```
