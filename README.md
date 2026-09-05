# Teese

Minimal [Kanban board] Web application. Uses [Varasto] as storage, while the UI
has been implemented with [React] and [Material UI].

[kanban board]: https://en.wikipedia.org/wiki/Kanban_board
[varasto]: https://github.com/RauliL/varasto
[react]: https://reactjs.org
[material ui]: https://mui.com

## Requirements

- [Node.js](https://nodejs.org/) 22 or newer
- npm or [Yarn](https://yarnpkg.com/) (a `yarn.lock` is included)

## Installation

Clone this repository, then install dependencies:

```bash
git clone https://github.com/RauliL/teese.git
cd teese
npm install
```

For a production build of the UI and server bundle:

```bash
npm run build
```

## First use

Teese stores users and boards as JSON files under `./data` by default. On a fresh
install there are no accounts yet, so create the initial administrator by setting
these environment variables before starting the server:

| Variable               | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `TEESE_ADMIN_USERNAME` | Admin username (slug: lowercase letters, numbers, and hyphens) |
| `TEESE_ADMIN_PASSWORD` | Admin password (at least 8 characters)                         |

Example:

```bash
export TEESE_ADMIN_USERNAME=admin
export TEESE_ADMIN_PASSWORD=changeme123
```

The admin user is created only if those variables are set and that username does
not already exist. After the first successful start you can remove them from the
environment if you prefer.

Recommended for any real deployment:

| Variable         | Default                 | Purpose                                                          |
| ---------------- | ----------------------- | ---------------------------------------------------------------- |
| `JWT_SECRET`     | development placeholder | Secret used to sign authentication tokens                        |
| `JWT_EXPIRES_IN` | `7d`                    | Token lifetime (passed to [jose](https://github.com/panva/jose)) |
| `TEESE_DATA`     | `./data`                | Directory for Varasto JSON storage                               |
| `PORT`           | `3000`                  | HTTP listen port                                                 |

## Usage

### Development

```bash
npm run start:dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with the admin
credentials, then:

1. Open **Admin** and create any additional users under **Users**.
2. Create a board under **Manage boards** and add users to its allowed list.
3. Open the kanban view from the home page to work on items, comments, and
   status changes.

### Production

```bash
npm run build
npm start
```

The server listens on port `3000` unless you override it with `PORT`.
