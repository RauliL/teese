# Teese

Minimal [Kanban board] Web application. Uses [Varasto] as storage, while UI has
been implemented with [React] and [Material UI].

[kanban board]: https://en.wikipedia.org/wiki/Kanban_board
[varasto]: https://github.com/RauliL/varasto
[react]: https://reactjs.org
[material ui]: https://material-ui.com

## Requirements

- Node.js>=12

## Installation

Clone this Git repository somewhere, then install dependencies and build static
assets and other TypeScript'y stuff:

```bash
$ npm install
$ npm run build
```

## Usage

After installation, you can start the application with:

```bash
$ npm start
```

Which starts the backend HTTP server in port `3000`. You can change the default
port with `PORT` environment.
