exports = module.exports = createServer;


var http = require('http');
var Layer = require('./layer');

function createServer(){
  function app(req, res, next){
    app.handle(req, res, next); 
  }

  app.listen = function () {
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  }
  app.stack = [];
  app.use = function(route, middleware) {
    if(typeof route != 'string') {
      middleware = route;
      route = '/';
    }
    var layer = new Layer(route, middleware);
    this.stack.push(layer);

  }

  app.handle = function(req, res, out) {
    var stack = this.stack
    , index = 0
    , origin = null;

    function next(err) {
      var layer;
      layer = stack[index++];
      if (origin != null) {
        req.url = origin;
        origin = null;
      }
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
        req.params = {};
        var match = layer.match(req.url.toLowerCase());
        if (!match) return next(err);
        req.params = match.params;

        if ('function' == typeof layer.handle.handle) {
            if(layer.route != '/') {
              origin = req.url;
              req.url = req.url.substr(layer.route.length);
            }
        }

        var arity = layer.handle.length;
        if (err) {
          if (arity == 4) {
            layer.handle(err, req, res, next);
          } else {
            next(err);
          }
        } else if (arity < 4) {
          layer.handle(req, res, next);
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
