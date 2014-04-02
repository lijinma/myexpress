var express = require("../");

var request = require("supertest")
  , expect = require("chai").expect
  , http = require('http');

describe("app",function() {
  var app = express()
  describe("create http server",function() {
    // write your test here
    it("respon to /foo with 404", function(done) {
      request(app).get('/foo').expect(404).end(done);
    });
  });

  describe("Defining the app.listen method", function() {
    var port = 7001;
    var server;

    before(function(done) {
      server = app.listen(port,done);
    });

    it("should return an http.Server",function() {
      expect(server).to.be.instanceof(http.Server);
    });

    it("responds to /foo with 404",function(done) {
      request("http://localhost:" + port).get("/foo").expect(404).end(done);
    })
  });

});