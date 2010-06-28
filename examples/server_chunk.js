var sys = require('sys');
var service = require('./service_impl');
var RpcServer = require('../msgpackrpc_chunk').RpcServer;

var server = new RpcServer(service);
server.start(9999);
