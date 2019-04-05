
const http = require('http');
//const WebSocket = require('ws');

const server = http.createServer((clientRequest, clientResponse) => {
    const request = http.get(clientRequest.url, (proxyResp) =>{
        clientResponse.writeHead(proxyResp.statusCode, proxyResp.headers);
       proxyResp.pipe(clientResponse);
    });



    /*server.on('upgrade', (req, serverSocket) =>{
        serverSocket.write( "HTTP/1.1 101 Web Socket Protocol Handshake\r\n"
            + "Upgrade: WebSocket\r\n"
            + "Connection: Upgrade\r\n"
            + "WebSocket-Origin: http://localhost:3400\r\n"
            + "WebSocket-Location: ws://localhost:3400/\r\n"
            + "\r\n"
        );


    });

    request.on('upgrade', (res, socket) => {
        console.log('got upgraded!');
        socket.end();
        process.exit(0);
    });


    const wss = new WebSocket.Server({ port: 80 });

    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
        });

        ws.send('something');
    });*/

});

server.listen(8080);