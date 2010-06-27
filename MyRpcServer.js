var sys = require('sys');
var service = require('./ServiceModule');
var RpcServer = require('./MsgPackRpc').RpcServer;

var server = new RpcServer(service);
server.start(9999);
