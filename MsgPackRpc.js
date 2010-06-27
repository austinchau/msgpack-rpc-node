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
        var result = module[method].apply(this, params);
      } catch(e) {
        error = e;
      }

      var response = [];
      response.push(RESPONSE_TYPE);
      response.push(id);
      response.push(error);
      response.push(result);

      stream.write(msgpack.pack(response));	
    });
  });
};

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
  var conn = net.createConnection(this.port, this.host);
  
  conn.addListener('connect', function() {
    var request = [];
    var id = new Date().getTime();

    request.push(REQUEST_TYPE);
    request.push(id);
    request.push(method);
    request.push(params);
     
    var buffer = msgpack.pack(request);
    conn.write(buffer);
  });

  conn.addListener('data', function (data) {
    var response = msgpack.unpack(data);
    var error = response[2];

    var result = response[3];
    callback(result, null);
    
    conn.end();
    conn.destroy();
  });
};

exports.RpcServer = RpcServer;
exports.RpcClient = RpcClient;
