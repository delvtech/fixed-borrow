<!-- [![License](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](https://github.com/delvtech/hyperdrive-frontend/blob/master/LICENSE) -->

[![Static Badge](https://img.shields.io/badge/DELV-Terms%20Of%20Service-orange)](https://delv-public.s3.us-east-2.amazonaws.com/delv-terms-of-service.pdf)

## Hyperdrive-Borrow

A TypeScript monorepo containing apps and packages for integrating and
interacting with Hyperdrive Borrow.

Powered by [TurboRepo](https://turbo.build).

## What is inside?

Apps

- [@hyperdrive-borrow/ui](apps/hyperdrive-trading/) - A frontend for interacting with Hyperdrive Borrow

Packages

- [@hyperdrive-borrow/artifacts](packages/artifacts/) - ABIs and bytecode for protocol contracts
- [@hyperdrive-borrow/config](packages/config/) - Hyperdrive Borrow static metadata by chain

<!-- ### Creating a release

This repo uses [changesets](https://github.com/changesets/changesets) to manage
versioning and changelogs. This means you shouldn't need to manually change of
the internal package versions.

Before opening a PR, run `yarn changeset` and follow the prompts to describe the
changes you've made. This will create a changeset file that should be committed.

As changesets are committed to the `main` branch, the [changesets github
action](https://github.com/changesets/action) in the release workflow will
automatically keep track of the pending `package.json` and `CHANGELOG.md`
updates in an open PR titled `chore: version packages`.

Once this PR is merged, the release workflow will be triggered, creating new
tags and github releases, and publishing the updated packages to NPM. **These
PRs should be carefully reviewed!** -->

# Disclaimer

The language used in this code and documentation is not intended to, and does not, have any particular financial, legal, or regulatory significance.

---

Copyright © 2024 DELV

<!-- Licensed under the GNU Affero General Public License Version 3.0 (the "OSS License").

By accessing or using this code, you signify that you have read, understand and agree to be bound by and to comply with the [OSS License](https://www.gnu.org/licenses/gpl-3.0.html) and [DELV's Terms of Service](https://delv-public.s3.us-east-2.amazonaws.com/delv-terms-of-service.pdf). If you do not agree to those terms, you are prohibited from accessing or using this code.

Unless required by applicable law or agreed to in writing, software distributed under the OSS License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the OSS License and the DELV Terms of Service for the specific language governing permissions and limitations. -->
