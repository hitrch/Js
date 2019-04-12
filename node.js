
const http = require('http');
const net = require('net');
const url = require('url');

const server = http.createServer((clientRequest, clientResponse) => {
    const request = http.get(clientRequest.url, (proxyResp) =>{
        clientResponse.writeHead(proxyResp.statusCode, proxyResp.headers);
       proxyResp.pipe(clientResponse);
    });

});

server.on('connect', (clientRequest, clientSocket) => {
    const srvUrl = url.parse(`https://${clientRequest.url}`);
    const srvSocket = net.connect(srvUrl.port, srvUrl.hostname, () => {
        clientSocket.write(
            `HTTP/${clientRequest.httpVersion} 200 OK\r\nConnection: close\r\n\r\n`,
            'UTF-8',
            () => {
                srvSocket.pipe(clientSocket);
                clientSocket.pipe(srvSocket);
            }
        )
    })

    srvSocket.on('error', e => {
        console.log('srvSocket.on error: ', e);
    });

    clientSocket.on('error', e => {
        console.log('clientSocket.on error: ', e);
    });
});

server.listen(8080);