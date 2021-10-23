# Litentry JS

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

A monorepo for our npm packages. [Lerna JS](https://github.com/lerna/lerna) is used to make publishing easier. [Yarn Workspaces](https://yarnpkg.com/features/workspaces) is used to make development easier.

## Getting Started

Clone and bootstrap the project:

```sh
git clone git@github.com:litentry/litentry-js.git
cd litentry-js
yarn
```

## Publish

We use [fixed versioning](https://github.com/lerna/lerna#fixedlocked-mode-default). The publish command will bump _all_ packages.

```sh
lerna publish
```
