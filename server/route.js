
var connectHandlers = WebApp.connectHandlers;

connectHandlers.stack.splice(0, 0, {
  route: '/timeout-10sec',
  handle: function (req, res) {
    var start = new Date().getTime();

    setTimeout(function() {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('ping\n');
    }, 10 * 1000);
  }
});

connectHandlers.stack.splice(0, 0, {
  route: '/timeout-130sec',
  handle: function (req, res) {
    var start = new Date().getTime();

    setTimeout(function() {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('ping\n');
    }, 130 * 1000);
  }
});
