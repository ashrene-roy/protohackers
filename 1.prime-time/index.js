const net = require('net');
const server = net.createServer();

const isPrime = (num) => {
    if(!Number.isInteger(num)) return false;
    const squareRoot = Math.sqrt(num);
    for(let i = 2; i <= squareRoot; i++) {
        if(num % i == 0) return false;
    }
    return num >= 2;
}
const handleConnection = (connection) => {
    const address = JSON.stringify(connection.remoteAddress + ':' + connection.remotePort);
    console.log('New remote connection from: ' + address);

    let buffer = '';
    connection.on('data', (data) => {
        try {
            let prev = 0, next;
            data = data.toString();
            while((next = data.indexOf('\n', prev)) > -1) {
                buffer += data.substring(prev, next);
                console.log('Data from: ' + address + ' ' + buffer);
                const parsedJSON = JSON.parse(buffer);
                
                if(parsedJSON.method == null || parsedJSON.method != 'isPrime') {
                    throw new Error('Malformed request!');
                }
                if(parsedJSON.number == null || typeof(parsedJSON.number) !== 'number') {
                    throw new Error('Malformed request!');
                }
                let response = {
                    method: "isPrime",
                    prime: isPrime(parsedJSON.number)
                };
                connection.write(JSON.stringify(response) + '\n');
                buffer = '';
                prev = next + 1;
            }
        } catch (err) {
            let errResponse = {
                method: ''
            };
            if(connection.write(JSON.stringify(errResponse) + '\n')) {
                connection.destroy();
            }
        }
    });
    connection.on('close', () => {
        console.log('Connection closed with: ' + address);
    })
}

server.on('connection', handleConnection);

server.listen(8000, () => {
    console.log('Server listening!');
})