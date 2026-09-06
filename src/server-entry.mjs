import app from "./app.js";
import express from "express";
import path from "node:path";
import { normalizePort } from "@fvilers/normalize-port";

const clientDir = path.join(import.meta.dirname, "client");

app.use("/", express.static(clientDir, { index: "index.html" }));
app.use((req, res, next) => {
  if (req.method === "GET" && req.path.startsWith("/")) {
    res.sendFile(path.join(clientDir, "index.html"));
  } else {
    next();
  }
});

const port = normalizePort(process.env.PORT ?? "3000");
if (port === false) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
