# UserScript Template

An out-of-the-box template simplifying userscript development with auto-rebuilds
on file changes, seamless WebDAV integration for extension syncing, semantic
commit-based versioning, and a robust CI/CD pipeline for automated releases.

- UserScript Template
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
    - [1. Sync with fake WebDAV by extension](#1-sync-with-fake-webdav-by-extension)
    - [2. Use @require to import script](#2-use-require-to-import-script)
  - [FAQ](#faq)
    - [How to get the script’s UUID?](#how-to-get-the-scripts-uuid)

## Getting Started

### 1. Use this template to create a new repository

Click the `Use this template > Create a new repository` button to create a new
repository based on this template.

### 2. Clone the repository

```bash
git clone <YOUR REPOSITORY URL>/userscript-template.git
```

### 3. Install dependencies with `pnpm install`

This project uses [pnpm](https://pnpm.io/) as package manager, you can
install it by running:

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

For more detail, you can see [webpack.config.js](./webpack.config.js).

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

There are two way to setup the sync, one is using the WebDAV sync feature
provided by extension.

### 1. Sync with fake WebDAV by extension

#### 1. First, start dev server by running

```bash
pnpm dev
```

#### 2. Install the script to extension

After you start the dev server, you can install the script to extension.

The console output should hint you the link to install the script like this:

```bash
WebDAV server is listening on http://0.0.0.0:9000
You can install current script from: http://0.0.0.0:9000/bundle.user.js
```

Or if this is the first time you start this dev server, you should be able to
install the script from the link below:

http://localhost:9000/bundle.user.js

#### 3. Setup WebDAV sync in extension

Then you can setup the WebDAV sync in extension.

For Tampermonkey, you can follow the steps below:

1. Go to `Tampermonkey > Settings > General > Config Mode` and set as
   `Advanced`.
2. Fill `URL` in `Userscript Sync` with `http://localhost:8080/`.
3. Check `Enable Userscript Sync` in `Userscript Sync`.
4. Click `Save`.

Then you can click the "Run now" button to start sync.

### 2. Use @require to import script

There is another way to sync the script with extension, that is to create a new
script then using `@require` to import the script.

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

Note that if you use this way, the script will be cached by the extension. You
have to clear the cached script in extension after you rebuild the script.

e.g. For Tampermonkey, you can go to `Externals > Requires` in script editor and click `Delete` button.

## FAQ

### How to get the script's UUID?

The script's UUID is generated by your extension when you install the script. So
you have to install the script first, then you can find the UUID.

To find the UUID, you can click the script and open the built-in editor, then
you'll see the UUID in the URL.

e.g.
`chrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/options.html#nav=ac6c73b7-55ec-446e-884c-7cab2087278c+editor`

For example above, `ac6c73b7-55ec-446e-884c-7cab2087278c` is the UUID.

Or you can then click the "Settings" tab, there will be a "UUID" field in
"Details" section.
