# tezket-v2 (codename: SAMED)

NFTs are a decentralized way of tracking ownership, and a growing phenomenon in the digital asset.

In the age of digital ticketing, when a ticket is often little more than a QR code on an invoice, can NFTs continue the tradition of the ticket surviving the event?

TezKet is a platform to buy NFT ticket and use QR to control admittance at the gate.


### Deploy "NTFS_contract" on Ghostnet (Ithacanet).

```
nvm use v16.14.0
npm install

node ./script/build.js     # pls, install ligo compiler.
node ./script/deploy.js

node ./script/activateAccounts.js # (optional) use faucet1.json for deployer.

```

### Licensing

The contents of this repository are licensed under MIT License, see [LICENSE](LICENSE).
