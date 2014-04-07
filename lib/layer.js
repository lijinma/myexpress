var Layer = function(route, middleware) {
  this.handle = middleware;
  this.route = route;
  
}

exports = module.exports = Layer;

// var express = require('./myexpress');

Layer.prototype.match = function(route){
  if( route.match(this.route) ) {
    return {path: this.route};
  }
}

