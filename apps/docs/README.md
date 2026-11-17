# Luna documentation

This application hosts Luna's Storybook stories, browser tests, and supporting
documentation routes.

Run Storybook from the repository root:

```sh
pnpm storybook
```

Build the static documentation:

```sh
pnpm build-storybook
```

Run the documentation test suite:

```sh
pnpm --filter docs test
```

Stories must import Luna components through the public `@withalif/luna` package
entry point. They should cover meaningful interaction, accessibility, content,
and narrow-screen states rather than implementation details.
