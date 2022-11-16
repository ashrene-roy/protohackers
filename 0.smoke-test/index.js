const net = require('net');

const server = net.createServer();


const handleConnection = (connection) => {
    const address = JSON.stringify(connection.address());
    console.log('New remote connection from: ' + address);
    connection.on('data', (data) => {
        console.log(data.toString());
        connection.write(data);
    });
    connection.once('close', () => {
        console.log('Connection closed with: ' + address);
    });

}

server.on('connection', handleConnection);

server.listen(8000, () => {
    console.log('Server listening')
});
