var p2re = require("path-to-regexp");

var Layer = function(route, middleware) {
  this.handle = middleware;
  this.route = route;
  
}

exports = module.exports = Layer;

Layer.prototype.match = function(route){
  var keys = [];
  var regexp = p2re(this.route, keys, {end: false});
  var result = regexp.exec(route);
  var params = {};
  if(regexp.test(route)) {
    keys.forEach(function(key, index) {
      params[key.name] = result[index + 1];
    });
    return {
      path: route,
      params: params
    }
 }
}

