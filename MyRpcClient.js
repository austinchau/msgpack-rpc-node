var sys = require('sys');
var RpcClient = require('./MsgPackRpc').RpcClient;

var client = new RpcClient('localhost', 9999);

client.invoke('add', [4, 7], function(result, error) {
  if (error) {
    sys.puts("[rpc error] " + error);
    return;
  }
  sys.puts(result);
});
