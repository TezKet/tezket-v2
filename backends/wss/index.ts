

import WebSocket, { WebSocketServer } from 'ws';

import axios from 'axios';

const port = parseInt(process.env.PORT) || 8083;
// const storeMeta = 'http://localhost:5000';
const storeMeta = 'https://tezket-emu-api-pplpa5ifea-wl.a.run.app';

let sockets = new Map<string, WebSocket>();
const wss = new WebSocketServer({ port: port });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    // console.log('received: %s', data);
    // walletAddress, ws

    try {
      const obj = JSON.parse(data.toString());

      if(obj.userAddress != undefined) {
        sockets.set(obj.userAddress, ws);
        // console.log(sockets);

        if(obj.mode !== undefined) {
          if(obj.mode === "SIGN") {

          //   {
          //     "userAddress": "tz1i4W46rLC4qNHn2jcZmgUo6FQ1AEomhzjh",
          //     "mode": "SIGN",
          //     "signAddress": "tz1i4W46rLC4qNHn2jcZmgUo6FQ1AEomhzjh",
          //     "gateAddress": "tz1i4W46rLC4qNHn2jcZmgUo6FQ1AEomhzjh"
          //   }

            sockets.get(obj.signAddress)?.send(`SIGN:${obj.gateAddress}`);

          } else if(obj.mode === "LIST") {

            // sockets.get(obj.userAddress)?.send(`${}:${obj.gateAddress}`);

            // for (const [key, value] of sockets) {
            //   sockets.get(obj.userAddress)?.send(`${key}:${value}`);
            // }

            // console.log(sockets);

            sockets.forEach((value: WebSocket, key: string) => {
                sockets.get(obj.userAddress)?.send(`${key}`);
            });

            // for (let index in sockets) { 
            //   console.log(index);
            //   sockets.get(obj.userAddress)?.send(`${index}`);
            // } 

          } else if(obj.mode === "USE") {

          //   {
          //     "userAddress": "tz1i4W46rLC4qNHn2jcZmgUo6FQ1AEomhzjh",
          //     "mode": "USE",
          //     "signAddress": "tz1i4W46rLC4qNHn2jcZmgUo6FQ1AEomhzjh",
          //     "gateAddress": "tz1i4W46rLC4qNHn2jcZmgUo6FQ1AEomhzjh",
          //     "ticketId": "",
          //     "signature": "",
          //   }

          // UPDATE => USED

            
            const reqTicket = {
              status: "USED"
            };
            axios.patch(`${storeMeta}/ticket/${obj.ticketId}`,reqTicket);


            sockets.get(obj.gateAddress)?.send(`DONE:${obj.gateAddress}`);

            sockets.delete(obj.signAddress);
            sockets.delete(obj.gateAddress);
          }
        }

      } else {

        ws.close();
      }

    } catch (err) {

      console.log(err);
      ws.close();
    }

    
  });

  ws.on('close', function close() {
    console.log('disconnected');
  });

  // ws.send('something');
});
