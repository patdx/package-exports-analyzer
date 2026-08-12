# Package Exports Analyzer

This is a tool to help analyze which file is resolved in a package, especially
in relation to the newer package.json `exports` property.

I have not really maintained this tool recently, but if you are interested in,
you may also be interested in:

- https://publint.dev/

Available online at: https://package-exports.vercel.app/

## Development

Use `pnpm dev` to run the analyzer locally. `pnpm test`, `pnpm lint`, and
`pnpm build` run the resolver regression tests, static checks, and production
build respectively.

The condition picker models package export conditions in object order. The
`default` condition is always active, as required by the package exports
resolution algorithm. Explicit `null` targets are shown in the result because
they intentionally block the corresponding subpath.
