var sys = require('sys');
var RpcClient = require('../msgpackrpc').RpcClient;

var client = new RpcClient('localhost', 9999);

client.invoke('add', [9, 3], function(result, error) {
  if (error) {
    sys.puts('[rpc error] ' + error);
  } else {
    sys.puts(result);
  }
});

client.invoke('substract', [9, 3], function(result, error) {
  if (error) {
    sys.puts('[rpc error] ' + error);
  } else {
    sys.puts(result);
  }
});
