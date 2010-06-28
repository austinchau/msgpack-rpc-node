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
        currentBuffer = combineBuffer(currentBuffer, chunk);
      }
    });

    stream.addListener('end', function() {
      sys.log(typeof currentBuffer);
      var msg = msgpack.unpack(currentBuffer);
      currentBuffer = null;

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

function combineBuffer(b1, b2) {
  var buffer = new Buffer(b1.length + b2.length);
  b1.copy(buffer, 0, 0, b1.length - 1);
  b2.copy(buffer, b1.length, 0, b2.length - 1);
  b1 = null;
  b2 = null;
  return buffer;
}

function RpcClient(host, port) {
  this.host = host;
  this.port = port;
}

RpcClient.prototype.invoke = function(method, params, callback) {
  var conn = net.createConnection(this.port, this.host);
  var currentBuffer = null;
    
  conn.addListener('connect', function() {
    var id = new Date().getTime();
    var request = [REQUEST_TYPE, id, method, params];
    conn.write(msgpack.pack(request));
    conn.end();
  });

  conn.addListener('data', function (chunk) {
    // append chunk to buffer
    if (currentBuffer == null) {
      currentBuffer = chunk; 
    } else {
      currentBuffer = combineBuffer(currentBuffer, chunk);
    }
  });

  conn.addListener('end', function() {
    var response = msgpack.unpack(currentBuffer);
    currentBuffer = null;

    var error = response[2];
    var result = response[3];
    callback(result, error);
  });
};

exports.RpcServer = RpcServer;
exports.RpcClient = RpcClient;