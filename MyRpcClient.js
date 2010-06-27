var sys = require('sys');
var RpcClient = require('./MsgPackRpc').RpcClient;

var client = new RpcClient('localhost', 9999);

client.invoke('substract', [10, 3], function(result, error) {
  if (error) {
    sys.puts('[rpc error] ' + error);
  } else {
    sys.puts(result);
  }
  
  client.close();
});
