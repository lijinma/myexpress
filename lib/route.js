var makeRoute = function (verb, handler) {
  return function(req, res, next) {
    if(req.method.toLowerCase() == verb) {
      handler(req, res, next);
    } else {
      next();
    }
  }
}

exports = module.exports = makeRoute;