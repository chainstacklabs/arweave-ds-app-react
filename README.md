# Drop n' Sell

This repository contains the code neccessary to run the Drop & Sell app, a decentralized app to sell digital documents like ebooks and pdf files.

The application allows users to upload documents to Arweave, a decentralized permanent data store, and list them to sell on Polygon thanks to a smart contract deployed on the blockchain.

## Tech stack

Built with React (Next.js), TailwindCSS, Arweave and Solidity smart contracts deployed on Polygon.

### Smart contract

This app uses a smart contract deployed in Polygon. This contract holds the metadata of the files listed to sell and allows users to buy them.

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
