const moment = require("moment");
const fs = require("fs");
const randomstring = require("randomstring");

const express = require('express');
const cors = require("cors");

const { 
    execSync
} = require('child_process');
const axios = require('axios').default;

const pinataSDK = require('@pinata/sdk');

const { TezosToolkit, MichelsonMap } = require('@taquito/taquito');
const { InMemorySigner } = require('@taquito/signer');
const { char2Bytes, bytes2Char } = require("@taquito/utils");

// const rpc = 'https://ithacanet.ecadinfra.com';
const rpc = 'https://rpc.ghostnet.teztnets.xyz';
const status = 'https://api.ithaca.tzstats.com/explorer/status';

// const storeMeta = 'http://localhost:5000';
const storeMeta = 'https://tezket-emu-api-pplpa5ifea-wl.a.run.app';

const app = express();

const faucet1 = require('./faucet2.json');
const signer = InMemorySigner.fromFundraiser(faucet1.email, faucet1.password, faucet1.mnemonic.join(' '));
const Tezos = new TezosToolkit(rpc);
Tezos.setSignerProvider(signer);

let pinata;
if (process.env.NODE_ENV === "production") {
  pinata = pinataSDK(process.env.PINATA_API_KEY || '', process.env.PINATA_SECRET_KEY || '');
} else {
  const PinataKeys = require("./PinataKeys2.json");
  pinata = pinataSDK(PinataKeys.apiKey, PinataKeys.apiSecret);
}

const corsOptions = {
    origin: ["http://localhost:19006", 
      "http://10.42.0.87:19006", 
      "https://tezket-test.web.app"],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));

function respError(req, res, ticketId, nftState, msg, err) {
    if(err) {
      console.log(msg+"\r\n"+err);
    }
    res
      .status(500)
      .json({ 
        contractAddress: req.body.contractAddress,
        minterAddress: req.body.minterAddress,
        ticketTarget: req.body.ticketTarget,
        ticketId: ticketId, 
        ticketState: nftState,
        code: {
            status: false, 
            msg: msg
        }
      });
}



app.post('/mint', async function(req, res) {

  // validate payRef from SQ.
  // verify owner (mintAddress) by payRef and signRef.

  const ticketId = req.body.minterAddress + "-" + randomstring.generate(7);

  var nftPath = '';
  var nftState = 'REQUEST';
  // GENERATED
  // PINNED
  // MINTING
  // READYINUSE
  // USED

  var nftTicketId = '';
  var pinnedFile, pinnedMetadata;

  var eventInfo = undefined;
  var nftTxHash = '';

  // ticketType
  //  - [x] read metadata, type, period
  //  - [x] read img form meta and 
  //      gen [-] ticket Id + [x] qrcode.

  try {

    const eventRef = req.body.ticketTarget.split('/')[0];
    const ticketRef = req.body.ticketTarget.split('/')[1];

    eventInfo = await axios.get(`${storeMeta}/events/${eventRef}`);

    // console.log(eventInfo.data.tickets);
    var ticket = undefined;
    await eventInfo.data.tickets.forEach((value) => {
        if(value.ref === ticketRef)
        {
            ticket = value;
        }
    });

    if(ticket !== undefined) 
    {
        // let tId = 1; // ?
        let indexer = await axios.get(status);

        let ts = Date.now();
        // const datetime = moment(ts).format('MMMM Do YYYY, h:mm:ss a');
        const timestamp = moment(ts).format('DD/MM/YYYY hh:mm A');

        const bhigh = indexer.data.blocks;
        const period = eventInfo.data.timepref[0].valid

        await execSync(`qrencode -o ${__dirname}/${ticketId}.png \
        '${req.body.ticketTarget};${ticketId};${period};${bhigh};${req.body.minterAddress};${req.body.contractAddress};${req.body.payRef};${timestamp}'`, (err, stdout, stderr) => {
          if (err) {
           console.error("execSync (gen qr code):" + err);
           return;
          }
          console.log(stdout);
        });


        nftPath = `${__dirname}/${ticketId}.png`;
        nftTicketId = `${ticketId}`

        nftState = 'GENERATED';

    } 
    else 
    {
        respError(req,res,ticketId, nftState,'ERR: Invalid ticket.render='+mintTicket.ticketType, null);
        return;
    }


  } catch (err) {
    respError(req,res,ticketId, nftState,'ERR: Invalid ticketType='+req.body.ticketTarget, err);
    return;
  }

  // upload pinata
  // - gen IpfsHash Img & Metadata. 

  try {

    if(nftPath != '')
    {

      await pinata
        .testAuthentication()
        .catch((err) => {
          respError(req,res,'ERR: IPFS testAuthentication()', err);
        });

      const readableStreamForFile = fs.createReadStream(nftPath);

    //   console.log(eventInfo.data);

      const options = {
        pinataMetadata: {
          name: eventInfo.data.name.replace(/\s/g, "-"),
          keyvalues: {
            tag: eventInfo.data.tag[0],
            id: nftTicketId
          }
        }
      };
      pinnedFile = await pinata.pinFileToIPFS(
        readableStreamForFile,
        options
      );

      if (pinnedFile.IpfsHash && pinnedFile.PinSize > 0) {

        // fs.unlinkSync(nftpath);

        const metadata = {
          version: 2,
          ticketId: nftTicketId,
          name: eventInfo.data.name,
          description: eventInfo.data.description,
          symbol: "TZT"+"-"+req.body.ticketTarget,
          artifactUri: `ipfs://${pinnedFile.IpfsHash}`,
          displayUri: `ipfs://${pinnedFile.IpfsHash}`,
          creators: ["tezket"],
          decimals: 0,
          thumbnailUri: "https://tezostaquito.io/img/favicon.png",
          is_transferable: true,
          shouldPreferSymbol: false
        };
  
        pinnedMetadata = await pinata.pinJSONToIPFS(metadata, {
          pinataMetadata: {
            name: "TZT-metadata"
          }
        });

        if (pinnedMetadata.IpfsHash && pinnedMetadata.PinSize > 0) {

          nftState = 'PINNED';

          

        } else {

          // LOG FOR RECOVERY ...
          respError(req,res,ticketId, nftState,"ERR: metadata were not pinned (Pinata)", null);
          return;
        }

      } else {

        // LOG FOR RECOVERY ...
        respError(req,res,ticketId, nftState,"ERR: file was not pinned (Pinata)", null);
        return;
      }

    }

  } catch (err) {
    respError(req,res,ticketId, nftState,'ERR: run Pinata script='+nftTicketId, err);
    return;
  }

  if(nftState == "PINNED") 
  {
      // Mint XXX
      const contract = await Tezos.contract.at(req.body.contractAddress);
      const op = await contract.methods
              .mint(char2Bytes("ipfs://" + pinnedMetadata.IpfsHash), 
                  req.body.minterAddress)
              .send();
      await op.confirmation();

      nftTxHash = op.hash;

      const reqTicket = {
          timestamp: new Date().toISOString(),
          contractAddress: req.body.contractAddress,
          minterAddress: req.body.minterAddress,
          ticketTarget: req.body.ticketTarget,
          ticketId: nftTicketId,
          ipfs: {
            imageHash: pinnedFile.IpfsHash,
            metadataHash: pinnedMetadata.IpfsHash
          },
          txhash: nftTxHash,
          status: "READYINUSE"
        };
      let result = 
        await axios.post(`${storeMeta}/ticket`,reqTicket);
        
      console.log(result);

      fs.unlinkSync(nftPath);

      // LOG FOR RECOVERY ...
  }

  res.status(200).json({ 
    contractAddress: req.body.contractAddress,
    minterAddress: req.body.minterAddress,
    ticketTarget: req.body.ticketTarget,
    code: {
        status: true,
        ipfs: {
          imageHash: pinnedFile.IpfsHash,
          metadataHash: pinnedMetadata.IpfsHash
        },
        txhash: nftTxHash
    }
  });

});

app.get('/', async function (req, res) {

    let result = await axios.get(status);
    const blockheight = result.data.blocks;

    res.send(`Hello developers! <br/><br/>RPC: ${rpc}<br/>Block Height: ${blockheight}`);
});

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    // console.log('server is listening on port', port);
    
});