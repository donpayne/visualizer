"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const port = process.argv[2] || 8080;

http.createServer(server).listen(port, () => {
  console.log(`Server listening on localhost:${port}`);
});

function server(req, res) {
  let pathname = `.${req.url}`
  if (!fs.existsSync(pathname)) {
    res.statusCode = 404;
    res.end(`File ${pathname} not found!`);
    return;
  }

  fs.readFile(pathname, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end(`Error getting the file: ${err}.`);
    } else {
      res.setHeader("Content-type", getContentType(path.parse(pathname).ext));
      res.end(data);
    }
  });
}

function getContentType(ext) {
  return (
    {
      ".ico": "image/x-icon",
      ".html": "text/html",
      ".js": "text/javascript",
      ".json": "application/json",
      ".css": "text/css",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".wav": "audio/wav",
      ".mp3": "audio/mpeg",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".doc": "application/msword"
    }[ext] || "text/plain"
  );
}
