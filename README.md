---
description: 'codename: SAMED'
---

# TezKet v2

NFTs are a decentralized way of tracking ownership, and a growing phenomenon in the digital asset.

In the age of digital ticketing, when a ticket is often little more than a QR code on an invoice, can NFTs continue the tradition of the ticket surviving the event?

TezKet is a platform to buy NFT ticket and use QR to control admittance at the gate.

&#x20;[More](https://gist.github.com/ubinix-warun/fe48b4e72457b59cb01a732b6abde4c0).

### Deploy "NTFS\_contract" on Ghostnet.

```
nvm use v16.14.0
npm install

node ./script/build.js     # pls, install ligo compiler.
node ./script/deploy.js

node ./script/activateAccounts.js # (optional) use faucet1.json for deployer.
```

### Contributing

Learn how to contribute to a project in [Code of Conducts](https://github.com/TezKet/tezket-v2/blob/main/docs/CODE\_OF\_CONDUCT.md) and [Contributing](https://github.com/TezKet/tezket-v2/blob/main/docs/CONTRIBUTING.md).

### Licensing

The contents of this repository are licensed under MIT License, see [LICENSE](https://github.com/TezKet/tezket-v2/blob/main/LICENSE).
