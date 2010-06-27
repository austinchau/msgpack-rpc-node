var sys = require('sys');
var RpcClient = require('./MsgPackRpc').RpcClient;

var client = new RpcClient('localhost', 9999);

client.invoke('add', [4, 7], function(result) {
  sys.puts(result);
});
