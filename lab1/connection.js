import { v4 as uuidv4 } from 'uuid';

const msgTypes = {
    JOIN: 0,
    MESSAGE: 1,
    ID: 2,
};

export function doServer(wss, ws, rooms) {
    let room = null;
    let person = null;

    ws.on("message", (data) => {
        const msg = JSON.parse(data.toString());

        switch (msg.msg_type) {
            case msgTypes.JOIN: {
                join(msg);
                broadcast({
                    msg_type: msgTypes.JOIN,
                    users: [...room.persons].map(p => ({ name: p.name, id: p.id })),
                });
                break;
            };

            case msgTypes.MESSAGE: {
                broadcast({
                    msg_type: msgTypes.MESSAGE,
                    user: person.name,
                    id: person.id,
                    text: msg.text,
                });
                break;
            };
        }
    });

    ws.on("close", () => {
        quitRoom();
        console.log("❌ Connection closed");
    });

    function join(msg) {
        quitRoom();

        person = newPerson(msg.user, ws);

        if (rooms.has(msg.room)) {
            room = rooms.get(msg.room);
        } else {
            room = new Room(msg.room);
            rooms.set(msg.room, room);
        }

        room.joinRoom(person);

        const message = JSON.stringify({
            msg_type: msgTypes.ID,
            id: person.id,
        });

        ws.send(message);
    }

    function broadcast(msg) {
        const message = JSON.stringify(msg);
        const clients = new Set([...room.persons].map(p => p.client));

        wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN && clients.has(client)) {
                client.send(message);
            }
        });
    }

    function quitRoom() {
        if (room &&
            rooms.has(room.getName())) {

            room.quitRoom(person);

            if (room.isEmpty()) {
                rooms.delete(room);
            }
        }
    }

    function newPerson(name, client) {
        return {
            id: uuidv4(),
            name: name,
            client: client,
        }
    }
};

class Room {
    constructor(name) {
        this.name = name;
        this.persons = new Set();
    }

    getName() {
        return this.name;
    }

    quitRoom(person) {
        this.persons.delete(person);
    }

    joinRoom(person) {
        this.persons.add(person);
    }

    isEmpty() {
        return this.persons.size === 0;
    }
}