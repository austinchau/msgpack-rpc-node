var sys = require('sys');
var RpcClient = require('./MsgPackRpc').RpcClient;

var client = new RpcClient('localhost', 9999);

var hugeStr = '';

for (var i=0; i<100000; i++) {
  hugeStr += 'a';
}
client.invoke('echo', [hugeStr], function(result, error) {
  sys.puts(result.length);
});

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
