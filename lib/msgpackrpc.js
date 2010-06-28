var sys = require('sys');
var net = require('net');
var msgpack = require('msgpack');
var Buffer = require('buffer').Buffer;
var events = require('events');

const REQUEST_TYPE = 0;
const RESPONSE_TYPE = 1;

function RpcServer(module) {
  this.server = net.createServer(function(stream) {
    var ms = new msgpack.Stream(stream);
    
    ms.addListener('msg', function(request) {
      var type = request[0];
      var id = request[1];
      var method = request[2];
      var params = request[3];
      
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
    });
  });
}

RpcServer.prototype.start = function(port) {
  this.server.listen(port, function() {
    sys.log('rpc server started port=' + port);
  });
};

function RpcClient(host, port) {
  var self = this;
  events.EventEmitter.call(self);
  self.stream = net.createConnection(port, host);
  self.seqNum = 0; 
  self.callbacks = {};

  self.stream.addListener('connect', function() {
    self.ms = new msgpack.Stream(self.stream);
    self.ms.addListener('msg', function(response) {
      var type = response[0];
      var id = response[1]; 
      var error = response[2];
      var result = response[3];

      self.callbacks[id].call(this, result, error);
    });
    self.emit('ready');
  });
}

sys.inherits(RpcClient, events.EventEmitter);

RpcClient.prototype.close = function() {
  this.stream.destroy();
}

RpcClient.prototype.invoke = function(method, params, callback) {
  var id = this.seqNum;
  this.seqNum++;
  this.callbacks[id] = callback;
  var request = [REQUEST_TYPE, id, method, params];
  this.stream.write(msgpack.pack(request));
};

function combineBuffer(b1, b2) {
  var buffer = new Buffer(b1.length + b2.length);
  b1.copy(buffer, 0, 0, b1.length - 1);
  b2.copy(buffer, b1.length, 0, b2.length - 1);
  return buffer;
}

exports.RpcServer = RpcServer;
exports.RpcClient = RpcClient;
