var p2re = require("path-to-regexp");

var Layer = function(route, middleware, isStrict) {
  this.handle = middleware;
  route = stripTrailingSlash(route);
  this.route = route;
  this.isStrict = isStrict ? isStrict : false;
}

exports = module.exports = Layer;

Layer.prototype.match = function(route){
  route = decodeURIComponent(route);
  route = stripTrailingSlash(route);
  if(!route) route = '/';
  var keys = [];
  var regexp = p2re(this.route, keys, {end: this.isStrict});
  var result = regexp.exec(route);
  var params = {};
  if(regexp.test(route)) {
    keys.forEach(function(key, index) {
      params[key.name] = result[index + 1];
    });
    return {
      path: result[0],
      params: params
    }
  }
  return undefined;
}

function stripTrailingSlash(route) {
  return route[route.length - 1] === '/' ? route.substr(0, route.length - 1) : route;
}
