const net = require('net');
const crypto = require('crypto');

const server = net.createServer();
let users = [];

const handleConnection = (connection) => {
    
    connection.write('Welcome to budgetchat! What shall I call you?\n');
    let user = {
        id: crypto.randomUUID(),
        connection: connection,
        joined: false,
        name: ''
    };
    let data = '';
    connection.on('data', (d) => {
        const input = d.toString('utf-8');
        data += input.replace(/\n/g, '');
        if (input[input.length - 1] !== '\n') {
            return;
        }
        
        console.log('--- ' + data + ' ' + connection.remoteAddress+':' +connection.remotePort);
        if(!user.joined) {
            user.name = data;
            if( user.name.length < 1 ||!((/^[a-zA-Z0-9]+$/).test(user.name)) || user.name.length > 17 ) {

                let newUsers = users.filter(u => {
                    return u.id !== user.id;
                });
                users = newUsers;
                
                connection.destroy();
                return;
            }
            
            let others = '';
            users.forEach(u => {
                
                if(u.id !== user.id && u.joined) {
                    others += u.name + ', ';
                    console.log(u.name + ' * ' + user.name + ' has entered the room\n');
                    u.connection.write('* ' + user.name + ' has entered the room\n');
                }
            });
            console.log('* The room contains: ' + others.slice(0, others.length-2) + '\n');
            connection.write('* The room contains: ' + others.slice(0, others.length-2) + '\n');
            user.joined = true;
            users.push(user);
        } else {
            users.forEach(u => {
                if(u.id !== user.id) {
                    console.log(u.name + ' [' + user.name + '] ' + data.slice(0, 1001));
                    u.connection.write('[' + user.name + '] ' + data.slice(0, 1001) + '\n');
                }
            });
        }
        data = '';
        return
    });
    connection.on('close', () => {
        users.forEach(u => {
            console.log(`uId ${u.id} userId ${user.id} userName ${user.name}`);
            if(u.id !== user.id && u.joined && user.joined) {
                console.log(u.name + ' * ' + user.name + ' has left the room\n');
                u.connection.write('* ' + user.name + ' has left the room\n');
            }
        });
        let newUsers = users.filter(u => {
            return u.id !== user.id;
        });
        users = newUsers;
        console.log('Connection closed with client: ' + user.name);
    });
}

server.on('connection', handleConnection);

server.listen(8000, () => {
    console.log('Server listening!');
})