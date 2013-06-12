var net;

net = require('net');

module.exports = {
  tcpRequest: function(port, hostname, request, cb) {
    var calledBack, response, socket;
    socket = net.createConnection(port, hostname);
    socket.setEncoding('utf8');
    socket.setTimeout(5000);
    socket.on('connect', function() {
      return socket.write(request);
    });
    response = '';
    calledBack = false;
    socket.on('data', function(data) {
      return response += data;
    });
    socket.on('error', function(error) {
      if (!calledBack) {
        cb(error);
      }
      return calledBack = true;
    });
    socket.on('timeout', function() {
      socket.end();
      if (!calledBack) {
        cb(new Error("request to " + hostname + ":" + port + " timed out"));
      }
      return calledBack = true;
    });
    return socket.on('close', function(hadError) {
      if (!calledBack) {
        cb(null, response);
      }
      return calledBack = true;
    });
  },
  whoisRequest: function(whoisServer, command, cb) {
    return module.exports.tcpRequest(43, whoisServer, "" + command + "\r\n", cb);
  }
};

