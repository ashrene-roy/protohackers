const net = require('net');
const crypto = require('crypto');

const server = net.createServer();
let users = [];

const validateUserName = (name) => {
    return name.length > 0 && ((/^[a-zA-Z0-9]+$/).test(name)) && name.length < 17;
}

const broadcast = (presentUser, message, cb = null) => {
    users.forEach(user => {
        if(user.id !== presentUser.id && user.joined) {
            console.log(message);
            user.connection.write(message);
            if(cb) cb(user);
        }
    });
}
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
        
        if(!user.joined) {
            user.name = data;
            if(!validateUserName(user.name) ) {
                let newUsers = users.filter(u => {
                    return u.id !== user.id;
                });
                users = newUsers;
                connection.destroy();
                return;
            }
            
            let others = '';
            broadcast(user, '* ' + user.name + ' has entered the room\n', (u) => {
                others += u.name + ', ';
            });
            console.log(others);
            connection.write('* The room contains: ' + others.slice(0, others.length-2) + '\n');
            user.joined = true;
            users.push(user);
        } else {
            broadcast(user, '[' + user.name + '] ' + data.slice(0, 1001) + '\n');
        }
        data = '';
        return;
    });
    connection.on('close', () => {
        if(users.includes(user))  {
            broadcast(user, '* ' + user.name + ' has left the room\n');
            let newUsers = users.filter(u => {
                return u.id !== user.id;
            });
            users = newUsers;
        }
        console.log('Connection closed with client: ' + user.name);
    });
}

server.on('connection', handleConnection);

server.listen(8000, () => {
    console.log('Server listening!');
})