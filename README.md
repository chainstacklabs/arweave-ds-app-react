# Decentralized music marketplace

This repository contains the code neccessary to run a decentralized music marketplace app.

- Users will be able to upload MP3 files and list them for sale by a price.
- The songs will be uploaded to Arweave via Bundlr and the metadata (title, price, author and download link) will be stored in a smart contract deployed in Polygon.
- Other users will bee able to browse listed songs and buy them.
- When a user buys a song, the tokens will be sent to the author and the buyer will get a link to download the it.

We'll limit this app to MP3 files. In addition, the songs will be bought and sold using MATIC, but you can extend this app to work with other file types and multiple protocols if you want.

## Tech stack

Built with React (Next.js), TailwindCSS, Arweave and Solidity smart contracts deployed on Polygon.

### Smart contract

This app uses a smart contract deployed in Polygon. This contract holds the metadata of the songs listed to sell and allows users to buy them.

To compile and run the contract tests run `npm run test`. The compiled contract artifacts will be created on the `/artifacts` folder (included in the build).

### Front end

This app is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, install all dependencies with `npm i` and run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
