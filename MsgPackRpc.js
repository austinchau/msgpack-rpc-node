var sys = require('sys');
var net = require('net');
var msgpack = require('msgpack');

function RpcServer(module) {
  this.server = net.createServer(function(stream) {
    stream.addListener('data', function(data) {
      var msg = msgpack.unpack(data);
      var type = msg[0];
      var id = msg[1];
      var method = msg[2];
      var params = msg[msg.length - 1];
      var result = module[method].apply(this, params);	

      var response = [];
      response.push(1);
      response.push(id);
      response.push(null);
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

    var type = 0; // Request type

    request.push(type);
    request.push(id);
    request.push(method);
    request.push(params);
     
    var buffer = msgpack.pack(request);
    conn.write(buffer);
  });

  conn.addListener('data', function (data) {
    var response = msgpack.unpack(data);
    var error = response[2];

    if (error != null) {
      sys.puts('this call has incurred an error');
      callback(null);
      return;
    }

    var result = response[3];
    callback(result);
    
    conn.end();
    conn.destroy();
  });
};

exports.RpcServer = RpcServer;
exports.RpcClient = RpcClient;
