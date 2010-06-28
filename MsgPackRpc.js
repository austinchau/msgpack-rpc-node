var sys = require('sys');
var net = require('net');
var msgpack = require('msgpack');
var Buffer = require('buffer').Buffer;

const REQUEST_TYPE = 0;
const RESPONSE_TYPE = 1;

function RpcServer(module) {
  
  var currentBuffer = null
  
  this.server = net.createServer(function(stream) {
    stream.addListener('data', function(chunk) {
      // append chunk to buffer
      if (currentBuffer == null) {
        currentBuffer = chunk; 
      } else {
        var newBuffer = new Buffer(currentBuffer.length + chunk.length);
        currentBuffer.copy(newBuffer, 0, 0, currentBuffer.length - 1);
        chunk.copy(newBuffer, currentBuffer.length, 0, chunk.length - 1);
        currentBuffer = newBuffer;
      }
    });

    stream.addListener('end', function() {
      var msg = msgpack.unpack(currentBuffer);
      var type = msg[0];
      var id = msg[1];
      var method = msg[2];
      var params = msg[msg.length - 1];
      
      var error = null;
      var result = null;

      try {
        sys.log('executing method=' + method);
        result = module[method].apply(this, params);
      } catch(e) {
        sys.log('Exception invoking ' + method + ': ' + e);
        error = e;
      }

      var response = [RESPONSE_TYPE, id, error, result];
      stream.write(msgpack.pack(response));
      stream.end();
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
  var currentBuffer = null;
    
  conn_.addListener('connect', function() {
    var id = new Date().getTime();
    var request = [REQUEST_TYPE, id, method, params];
    conn_.write(msgpack.pack(request));
    conn_.end();
  });

  conn_.addListener('data', function (chunk) {
    // append chunk to buffer
    if (currentBuffer == null) {
      currentBuffer = chunk; 
    } else {
      var newBuffer = new Buffer(currentBuffer.length + chunk.length);
      currentBuffer.copy(newBuffer, 0, 0, currentBuffer.length - 1);
      chunk.copy(newBuffer, currentBuffer.length, 0, chunk.length - 1);
      currentBuffer = newBuffer;
    }
  });

  conn_.addListener('end', function() {
    var response = msgpack.unpack(currentBuffer);
    var error = response[2];
    var result = response[3];
    callback(result, error);
  });
};

exports.RpcServer = RpcServer;
exports.RpcClient = RpcClient;
