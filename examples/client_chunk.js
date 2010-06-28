var sys = require('sys');
var RpcClient = require('../msgpackrpc_chunk').RpcClient;

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
var str = '';

for (var i=0; i < 100000; i++) {
  str += 'a';
}

sys.puts(str.length);
client.invoke('echo', [str], function(result, error) {
  sys.puts(result.length);
});



