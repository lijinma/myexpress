exports = module.exports = createServer;


var http = require('http');

function createServer(){
  function app(req, res, next){
    app.handle(req, res, next); 
  }

  app.listen = function () {
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  }
  app.stack = [];
  app.use = function(fn) {
    this.stack.push(fn);
  }

  app.handle = function(req, res, out) {
    var stack = this.stack
      , index = 0;

    function next(err) {
      var layer;
      layer = stack[index++];
      if (!layer) {
        if (out) return out(err);
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/html');
          res.end('500 - Internal Error');
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html');
          res.end("404 - Not Found");
        }
        return;
      }
      try {
        var arity = layer.length;
        if (err) {
          if (arity == 4) {
            layer(err, req, res, next);
          } else {
            next(err);
          }
        } else if (arity < 4) {
          layer(req, res, next);
        } else {
          next();
        }
      } catch (e) {
        next(e);
      }
    }
    next();
  }

  return app;
}
