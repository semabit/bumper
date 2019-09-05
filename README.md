# Version read/write plugin for release-it

This plugin reads and/or writes version/manifest files.

```
# npm
npm install --save-dev @semabit/release-it-bumper

# yarn
yarn add --dev @semabit/release-it-bumper
```

In [release-it](https://github.com/release-it/release-it) config:

```json
"plugins": {
  "@semabit/release-it-bumper": {
    "out": "manifest.json"
  }
}
```

for `.yaml` file:
```json
"plugins": {
  "@semabit/release-it-bumper": {
    "out": { "file": "version.yaml", "type": "application/x-yaml" }
  }
}
```

In case the `in` option is used, the version from this file will take precedence over the `version` from `package.json`
or the latest Git tag (which release-it uses by default).

The default `type` is `application/json`, but `text/plain` and `application/x-yaml` are also supported.
In that case the whole file is used to read and/or write the version.

```json
"plugins": {
  "@semabit/release-it-bumper": {
    "in": { "file": "VERSION", "type": "text/plain" },
    "out": { "file": "VERSION", "type": "text/plain" }
  }
}
```

```json
"plugins": {
  "@semabit/release-it-bumper": {
    "in": { "file": "version.yaml", "type": "application/x-yaml" },
    "out": { "file": "version.yaml", "type": "application/x-yaml" }
  }
}
```

The `out` option can also be an array of files:

```json
"plugins": {
  "@semabit/release-it-bumper": {
    "out": ["manifest.json", "bower.json", { "file": "version.yaml", "type": "application/x-yaml" }]
  }
}
```

The `path` option (default: `"version"`) can be used to change a different property. the following example will set the
`deeper.current` property to the new version in `manifest.json`. Also possible to define the path for `yaml` files:

```json
"plugins": {
  "@semabit/release-it-bumper": {
    "out": [
      { "file": "manifest.json", "path": "deeper.current" },
      { "file": "version.yaml", "type": "application/x-yaml", "path": "parameters['app.version']" }
    ]
  }
}
```
