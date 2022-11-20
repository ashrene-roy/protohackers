const dgram = require("dgram");

const server = dgram.createSocket("udp4");

let store = {
    "version": "Ken's Key-Value Store 1.0"
};

const processInsert = (key, value) => {
    if(key == "version") return;
    store[key] = value;
}

const processRetrieve = (key) => {
    return store[key] ? `${key}=${store[key]}` : `${key}=`
}

const isInsertQuery = (query) => {
    return query.indexOf('=');
}

server.on("listening", () => {
    console.log("Server listening!");
});

server.on("message", (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    const query = msg.toString();
    const index = isInsertQuery(query);
    if(index > -1) {
        const key = query.substring(0, index);
        const value = query.substring(index+1);
        processInsert(key, value);
    } else {
        console.log(`server sent: ${processRetrieve(query)} to ${rinfo.address}:${rinfo.port}`);
        const response = processRetrieve(query);
        server.send(response, rinfo.port, rinfo.address);
    }
});

server.bind(8000);