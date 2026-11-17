# Releasing Luna

Luna currently uses Git tags for internal milestone releases. The
`@withalif/luna` package remains private and must not be published to npm.

## Prepare a release

1. Start from a clean `main` branch that is synchronized with `origin/main`.
2. Set the root and `@withalif/luna` package versions to the release version.
3. Move the relevant changelog entries into a dated release section.
4. Run the release gate:

   ```sh
   pnpm install --frozen-lockfile
   pnpm release:check
   ```

5. Review the static Storybook output and the cross-pattern application story.
6. Commit the release preparation:

   ```sh
   git commit -m "chore(release): prepare v0.5.0"
   ```

## Tag the release

Create the tag only after the preparation commit has passed CI and review:

```sh
git tag -a v0.5.0 -m "Release v0.5.0 - Application Patterns"
git push origin main
git push origin v0.5.0
```

Create a GitHub release from the tag and use the matching changelog section as
its release notes.

## Publish Storybook

The `Deploy Storybook` workflow builds and deploys Storybook after a push to
`main`, or when started manually.

Before the first deployment, open the repository's **Settings → Pages** and set
**Source** to **GitHub Actions**. The workflow then manages subsequent
deployments through the `github-pages` environment.
