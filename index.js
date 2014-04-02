var http = require('http');

module.exports = function(){
  var app = function(req, res) {
    res.statusCode = 404;
    res.end();
  }
  app.listen = function (port, callback) {
    return http.createServer(app).listen(port, callback);
  }
  return app;
}

