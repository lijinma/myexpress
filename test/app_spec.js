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


  describe("calling middleware stack",function() {
    var app;
    beforeEach(function() {
      app = new express();
    });

    it("Should be able to call a single middleware", function(done) {
      var m1 = function(req,res,next) {
        res.end("hello from m1");
      };
      app.use(m1);
      request(app).get('/').expect('hello from m1').end(done);
    });

    it("Should be able to call next to go to the next middleware:", function(done) {
      var m1 = function(req,res,next) {
        next();
      };

      var m2 = function(req,res,next) {
        res.end("hello from m2");
      };
      app.use(m1);
      app.use(m2);
      request(app).get('/').expect('hello from m2').end(done);
    });

    it("Should 404 at the end of middleware chain:", function(done) {
      var m1 = function(req,res,next) {
        next();
      };

      var m2 = function(req,res,next) {
        next();
      };
      app.use(m1);
      app.use(m2);
      request(app).get('/').expect(404).end(done);
    })

    it("Should 404 if no middleware is added:", function(done) {
      request(app).get('/').expect(404).end(done);
    })
  });

describe('Implement Error Handling', function() {
  var app;
  beforeEach(function() {
    app = new express();
  });
  it('should return 500 for unhandled error', function(done) {
    var m1 = function(req,res,next) {
      next(new Error("boom!"));
    }
    app.use(m1)
    request(app).get('/').expect(500).end(done);
  });
  it('should return 500 for uncaught error', function(done) {
    var m1 = function(req,res,next) {
      throw new Error("boom!");
    };
    app.use(m1)
    request(app).get('/').expect(500).end(done);
  });
  it('should skip error handlers when next is called without an error', function(done) {
    var m1 = function(req,res,next) {
      next();
    }

    var e1 = function(err,req,res,next) {
        // timeout
      }

      var m2 = function(req,res,next) {
        res.end("m2");
      }
      app.use(m1);
      app.use(e1); // should skip this. will timeout if called.
      app.use(m2);
      request(app).get('/').expect("m2").end(done);
    });
  it('should skip normal middlewares if next is called with an error', function(done) {
    var m1 = function(req,res,next) {
      next(new Error("boom!"));
    }

    var m2 = function(req,res,next) {
        // timeout
      }

      var e1 = function(err,req,res,next) {
        res.end("e1");
      }

      app.use(m1);
      app.use(m2); // should skip this. will timeout if called.
      app.use(e1);
      request(app).get('/').expect("e1").end(done);
    });
});

describe('Implement App Embedding As Middleware', function() {
  var app;
  beforeEach(function() {
    app = new express();
    subApp = new express();
  });
  it('should pass unhandled request to parent', function(done) {
    function m2(req,res,next) {
      res.end("m2");
    }

    app.use(subApp);
    app.use(m2);
    request(app).get('/').expect("m2").end(done);
  });
  it('should pass unhandled error to parent', function(done) {
    function m1(req,res,next) {
      next("m1 error");
    }

    function e1(err,req,res,next) {
      res.end(err);
    }

    subApp.use(m1);

    app.use(subApp);
    app.use(e1);
    request(app).get('/').expect("m1 error").end(done);
  });
});

/* Missing lesson 4 */

describe('path parameters extraction', function() {
  beforeEach(function() {
    var Layer = require('../lib/layer');
    middleware = function() {};
    layer = new Layer("/foo/:a/:b", middleware)
  });
  it('returns undefined for unmatched path', function() {
    var result = layer.match("/foo");
    expect(result).to.be.undefined;
  });
  it("returns undefined if there isn't enough parameters", function() {
    var result = layer.match("/foo/apple");
    expect(result).to.be.undefined;
  });
  it('returns match data for exact match', function() {
    var result = layer.match("/foo/apple/xiaomi");
    expect(result).not.to.be.undefined;
    expect(result).to.have.property("path", "/foo/apple/xiaomi");
    /* ? expect(result).to.have.property("params", {a: "apple", b: "xiaomi"}); */
    expect(result.params).to.deep.equal({a: "apple", b: "xiaomi"});
  });

});

describe('Implement req.params', function() {
  var app;
  beforeEach(function() {
    app = express();
    app.use("/foo/:a",function(req,res,next) {
      res.end(req.params.a);
    });
    app.use("/foo",function(req,res,next) {
      res.end(""+req.params.a);
    });
  });

  it('should make path parameters accessible in req.params', function(done) {
    request(app).get('/foo/google').expect('google').end(done);
  });

  it('should make {} the default for req.params', function(done) {
    request(app).get('/foo').expect("undefined").end(done);
  });
});

describe('app should have the handle method', function() {
  var app;
  before(function(){
    app = express();
  })
  it('should have the handle method', function() {
    expect(app.handle).to.be.a("function");
  });
});

describe('Prefix path trimming', function() {
  var app;
  var subApp;
  before(function(){
    app = express();
    subApp = express();
    subApp.use("/bar",function(req, res) {
      res.end("embedded app: "+req.url);
    });
    app.use("/foo",subApp);
    app.use("/foo",function(req, res) {
      res.end("handler: "+req.url);
    });
  });

  it('trims request path prefix when calling embedded app', function(done) {
    request(app).get('/foo/bar').expect('embedded app: /bar').end(done);
  });
  it('restore trimmed request path to original when going to the next middleware', function(done) {
    request(app).get('/foo').expect('handler: /foo').end(done);
  });
});

describe('ensures leading slash', function() {
  var app;
  var subApp;
  before(function(){
    app = express();
    subApp = express();
    subApp.use("/",function(req, res) {
      res.end("/bar");
    });
    app.use("/bar",subApp);
  })
  it('ensures that first char is / for trimmed path', function(done) {
    request(app).get('/bar/').expect('/bar').end(done);
  });
});

});
