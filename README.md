# UserScript Template

An out-of-the-box userscript template based on Vue 3, simplifying development
with auto-rebuilds on file changes, seamless WebDAV integration for extension
syncing, semantic commit-based versioning, and a robust CI/CD pipeline for
automated releases.

- [Getting Started](#getting-started)
  - [1. Use this template to create a new repository](#1-use-this-template-to-create-a-new-repository)
  - [2. Clone the repository](#2-clone-the-repository)
  - [3. Install dependencies with pnpm install](#3-install-dependencies-with-pnpm-install)
  - [4. Adjust script basic informations in package.json](#4-adjust-script-basic-informations-in-packagejson)
  - [5. Start the dev server with pnpm dev](#5-start-the-dev-server-with-pnpm-dev)
  - [6. Setup sync for script to your extension](#6-setup-sync-for-script-to-your-extension)
  - [7. Start developing!](#7-start-developing)
- [Usage](#usage)
  - [1. Start the dev server](#1-start-the-dev-server)
  - [2. Build the script](#2-build-the-script)
- [Sync with extension](#sync-with-extension)
  - [Way 1. Use @require to import script](#way-1-use-require-to-import-script)
  - [Way 2. Sync with fake WebDAV by extension](#way-2-sync-with-fake-webdav-by-extension)
- [FAQ](#faq)
  - [If I does not needs display, will the Vue be included into the script?](#If-I-does-not-needs-display-will-the-Vue-be-included-into-the-script)

## Getting Started

### 1. Use this template to create a new repository

Click the [`Use this template > Create a new repository`](https://github.com/new?template_name=userscript-template&template_owner=moontai0724) button to create a new
repository based on this template.

### 2. Clone the repository

```bash
git clone <YOUR REPOSITORY URL>/userscript-template.git
```

### 3. Install dependencies with `pnpm install`

This project uses [pnpm](https://pnpm.io/) as package manager, you can install
it by running:

```bash
npm install -g pnpm
```

or directly install it:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

Then install dependencies by running:

```bash
pnpm install
```

### 4. Adjust script basic informations in `package.json`

This template will read informations in `package.json` to generate the script
header, so you have to adjust the informations in `package.json` to fit your
script.

The following fields are recommended to be filled first:

| Field         | Required | Description                                                    |
| ------------- | -------- | -------------------------------------------------------------- |
| `name`        | Yes      | The `name` of the script.                                      |
| `description` | Yes      | The `description` of the script.                               |
| `author.name` | Yes      | The `author` of the script, fill your name there.              |
| `homepage`    | No       | This will be the `namespace` and the `homepage` of the script. |

The script will read the `user-script-meta` field in `package.json` as the base
of the script header, then read above fields as an alternative value if empty.
It will take the key as the header field name, and take the value as the header
field value. So you can add any field you want to the `user-script-meta` field.

For more detail, you can see [rollup.config.ts](./rollup.config.ts).

The version here will be auto updated by semantic commit message when you pushes
commits to `main` branch, by supporting of
[`standard-version`](https://github.com/conventional-changelog/standard-version).

If you're not familiar with semantic commit message, you can see [Conventional
Commits](https://www.conventionalcommits.org/) for more detail.

### 5. Start the dev server with `pnpm dev`

```bash
pnpm dev
```

For more detail, you can see [1. Start the dev server](#1-start-the-dev-server).

### 6. Setup sync for script to your extension

You could follows any one step in [Sync with extension](#sync-with-extension).

### 7. Start developing!

All done! Open `src/index.ts` and start editing.

## Usage

### 1. Start the dev server

To start a development WebDAV server and auto rebuild the script on file
changes, run:

```bash
pnpm dev
```

There are some environment variables you can use to customize the dev server:

- `PORT`: The port of fake WebDAV server, default is `9000`.
- `HOST`: The host of fake WebDAV server, default is `0.0.0.0`.
- `UUID`: The uuid of the scipt. This will force the script to use this UUID
  instead of detected or generated one. If not set, it will be a default value
  "12345678-1234-1234-123456789012", and it will be auto updated by matching the
  title of the script with the `name` got from `package.json` when the extension
  sync.
- `DEBUG`: Enable debug mode, default is `false`.

For example, if you want to change the port to `8080`, you can run:

```bash
PORT=8080 pnpm dev
```

### 2. Build the script

```bash
pnpm build
```

The built script will be in `dist` folder.

## Sync with extension

There are two way to setup the sync. To use the auto sync feature, you have to
start the dev server first.

```bash
pnpm dev
```

You can see [5. Start the dev server with pnpm
dev](#5-start-the-dev-server-with-pnpm-dev) for more detail.

### Way 1. Use @require to import script

#### Step 1-1. Add a loader script to your extension

This is the easiest way to sync the script with extension. You can add a loader
script to your extension, then use `@require` to import the script.

e.g. Create a new script with the following content:

```js
// ==UserScript==
// @name         Import script from url
// @description  A proxy script to import script from url
// @version      0.0.1
// @namespace    localhost
// @match        *://*/*
// @require      http://localhost:9000/bundle.user.js
// @grant        none
// ==/UserScript==
```

Then the script will be loaded by this script. You may now browse the website
and you'll find it works.

If you're using this way, you might have to check the script header.

#### Step 1-2. Clear the cached script in extension or set the cache time to 0

Note that if you use this way, the external script will be cached by the
extension. You can either manually clear the cached script in extension or set
the external script update time to always.

Manual clear the cached script in extension:

e.g. For Tampermonkey, you can go to `Externals > Requires` in script editor and
click `Delete` button.

Set the external script update time to always:

e.g. For Tampermonkey, you can go to `Settings > Externals` in extension
Settings and set `Update Interval` to `Always`.

### Way 2. Sync with fake WebDAV by extension

#### Step 2-1. Install the script to extension

After you start the dev server, you can install the script to extension.

The console output should hint you the link to install the script like this:

```bash
WebDAV server is listening on http://0.0.0.0:9000
You can install current script from: http://0.0.0.0:9000/bundle.user.js
```

Or if this is the first time you start this dev server, you should be able to
install the script from the link below:

http://localhost:9000/bundle.user.js

#### Step 2-2. Setup WebDAV sync in extension

Then you can setup the WebDAV sync in extension.

For Tampermonkey, you can follow the steps below:

1. Go to `Tampermonkey > Settings > General > Config Mode` and set as
   `Advanced`.
2. Fill `URL` in `Userscript Sync` with `http://localhost:8080/`.
3. Check `Enable Userscript Sync` in `Userscript Sync`.
4. Click `Save`.

Then you can click the "Run now" button to start sync.

## FAQ

### If I does not needs display, will the Vue be included into the script?

No. The bundler will only include the code you used into the script.
