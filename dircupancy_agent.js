var filewalker = require('filewalker');
var bossy = require("bossy");
var http = require('http');
var url = require('url');

// CONFIGURATION
var port = 1337;

// ONREQUEST()
function onRequest(req, res) {

  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    // console.log('POSTed: ' + body);
    var requestJSONBody = JSON.parse(body);
    // console.log("PATH: " + requestJSONBody.path);

    res.writeHead(200, {"Content-Type": "application/json"});

    filewalker(requestJSONBody.path)
    .on('done', function() {
      // console.log('%d dirs, %d files, %d bytes', this.dirs, this.files, this.bytes);
      var stats = {};
      stats.totalbytessize = this.bytes;
      stats.totalnumberofdirs = this.dirs;
      stats.totalnumberoffiles = this.files;
      // console.log(stats);

      res.write(JSON.stringify(stats, null, 2));
      res.end();
    })
    .walk();
  });

}

// MAIN -------------------

// Command line arguments parsing
var definition = {
  h: {
    description: 'Show help',
    alias: 'help',
    type: 'boolean'
  },
  p: {
    description: 'Path',
    alias: 'path',
    type: "string"
  },
  s: {
    description: 'Start the server',
    alias: 'start',
    type: "boolean"
  }
};

var args = bossy.parse(definition);

if (args instanceof Error) {
  console.error(args.message);
  return;
}

if (args.h) {
  console.log(bossy.usage(definition, 'dircupancy -p <path>'));
  return;
}

if (args.p) {
  checkDir(args.p);
}

if (args.s) {
  console.log("Starting the server...");
  http.createServer(onRequest).listen(port);
  console.log("Server is listening on port: " + port);
}
