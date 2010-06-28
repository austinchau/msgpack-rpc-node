var sys = require('sys');
var RpcClient = require('../lib/msgpackrpc').RpcClient;

var client = new RpcClient('localhost', 9999);

client.addListener('ready', function() {
  client.invoke('add', [9, 3], function(result, error) {
    if (error) {
      sys.puts('[rpc error] ' + error);
    } else {
      sys.puts(result);
    }
    
    for (var i=0, str=''; i < 100000; i++) {
      str += 'a';
    }

    client.invoke('echo', [str], function(result, error) {
      sys.puts(result.length);
      client.close();
    });
  });
});
