var sys = require('sys');
var net = require('net');
var msgpack = require('msgpack');

const REQUEST_TYPE = 0;
const RESPONSE_TYPE = 1;

function RpcServer(module) {
  this.server = net.createServer(function(stream) {
    stream.addListener('data', function(data) {
      var msg = msgpack.unpack(data);
      var type = msg[0];
      var id = msg[1];
      var method = msg[2];
      var params = msg[msg.length - 1];
      
      var error = null;
      var result = null;

      try {
        result = module[method].apply(this, params);
      } catch(e) {
        sys.log('Exception invoking ' + method + ': ' + e);
        error = e;
      }

      var response = [RESPONSE_TYPE, id, error, result];
      stream.write(msgpack.pack(response));	
    });
  });
}

RpcServer.prototype.start = function(port) {
  this.server.listen(port, function() {
    sys.log('rpc server started port=' + port);
  });
};

function RpcClient(host, port) {
  this.host = host;
  this.port = port;
}

RpcClient.prototype.invoke = function(method, params, callback) {
  if (!this.conn) {
    this.conn = net.createConnection(this.port, this.host);
  }
  
  var conn_ = this.conn;
  
  conn_.addListener('connect', function() {
    var id = new Date().getTime();

    var request = [REQUEST_TYPE, id, method, params];
    var buffer = msgpack.pack(request);
    conn_.write(buffer);
  });

  conn_.addListener('data', function (data) {
    var response = msgpack.unpack(data);
    var error = response[2];
    var result = response[3];
    callback(result, error);
  });
};

RpcClient.prototype.close = function() {
  this.conn.end();
  this.conn.destroy();
};

exports.RpcServer = RpcServer;
exports.RpcClient = RpcClient;

