var sys = require('sys'),
    http = require('http'),
    fs = require('fs'),
    index;
 
fs.readFile('C:/Users/facundo.a.ferrero/workspace/presentacion/WebContent/nodeTest.htm', function (err, data) {
    if (err) {
        throw err;
    }
    index = data;
});
 
http.createServer(function(request, response) {
    response.writeHeader(200, {"Content-Type": "text/html"});
    response.write(index);
    response.close();
}).listen(81);

console.log('Server running at http://127.0.0.1:81/');