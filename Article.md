# Building a decentralized music marketplace with Arweave and Polygon

File storage is one of the big.... In web2 applications we have services like AWS S3 or Cloudinary that provide an easy way to upload and query files through simple to use APIs.

In the web3 space there are multiple projects tackling this problem with IPFS, Filecoin and Arweave being the ones leading the race.

## Arweave in a nutsell?

[Arweave](https://www.arweave.org/) is a decentralized storage network (DSN) and it allows user to upload any type of file and pay a single fee at the time of uploading. This is one of the key differences with other protocols like IPFS, where you have to keep a balance in you wallet to keep you files online.

To upload data you need to pay using the Arweave native token, which you can buy it from different exchanges. In this article, we'll follow a different route using Bundlr (more on that later).

In addition, Arweave stores data permanently, they're never deleted from the DSN. This has allowed different use cases, like the permaweb. You can use Arweave to host a website and, as the data is stored permanently, it'll never be censored.

## Using Arweave with other tokens with Bundlr

[Bundlr](https://bundlr.network/) is a protocol build on top of Arweave that aims to solve some of Arweave's native limitations. With Bundlr you can upload files to Arweave paying with different tokens like ETH, SOL, MATIC or AVAX to name a few.

In addition, Bundlr uses bundles to reduce to cost of uploading files and even makes uploads free for files under 100kb.

You can [learn more about Bundlr in the docs](https://docs.bundlr.network/docs/overview).

## Decentralized music marketplace overview

To showcase Arweave and Bundlr, we're going to build a decentralized music marketplace app. Here is how it'll work:

- Users will be able to upload MP3 files and list them for sale by a price.
- The songs will be uploaded to Arweave via Bundlr and the metadata (title, price, author and download link) will be stored in a smart contract deployed in Polygon.
- Other users will bee able to browse listed songs and buy them.
- When a user buys a song, the tokens will be sent to the author and the buyer will get a link to download the it.

We'll limit this app to MP3 files. In addition, the songs will be bought and sold using MATIC, but you can extend this app to work with other file types and multiple protocols if you want.

### Tech stack

To build this project we'll use the following tech stack:

- Solidity to write the smart contract.
- Javascript to write smart contract tests and deployment script.
- React / Next.js for the frontend.

### Smart contract

We need a smart contract to store the song's metadata: title, price, author and URL to the file in Arweave.

As we don't want all users to be able to see the download URL of every song, we'll separate these into two different mappings, one with the public information (title, price and author) and another one `private` with the URL.

```js

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract DropAndSell {
    // File public metadata
    struct File {
        uint256 id;
        uint256 price;
        address owner;
        address[] buyers;
        string title;
    }

    // public info of all files
    File[] files;
    // stores file URLs
    mapping(uint256 => string) private filePaths;

    // events
    event FileListed(uint256 indexed id, string title, uint256 price);
    event FileSold(uint256 indexed id, address buyer);

    //....

}
```

To list a song for sale, users will provide a title, price and the URL of the file in Arweave. Then we'll just save that information in the `files` and `filePaths` state variables as follows:

```js
    function listFile(
        string memory _title,
        uint256 _price,
        string memory _arweaveURI
    ) public {
        // save file info to files array
        File memory file;
        // file id same as index in the array
        file.id = files.length;
        file.price = _price;
        file.owner = msg.sender;
        file.title = _title;
        // saves file in state variable
        files.push(file);

        // save the file's arweave URI in private mapping
        filePaths[file.id] = _arweaveURI;
        // emit event
        emit FileListed(file.id, _title, _price);
    }
```

Notice that we're also saving the owner using the `msg.sender` variable.

To buy a song, we'd need a payable function that receives the amount of MATIC and the song id. We'll transfer the funds to the author of the song and add the user's wallet address to the buyers array:

```js
    function buyFile(uint256 _id)
        external
        payable
        fileExists(_id)
        isNotOwner(_id)
    {
        // check if sender has enough funds
        require(msg.value >= files[_id].price, "Not enough funds");

        // transfer funds
        address payable receiver = payable(files[_id].owner);
        (bool sent, ) = receiver.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        // add sender to buyers array
        files[_id].buyers.push(msg.sender);

        emit FileSold(_id, msg.sender);
    }
```

We're using two modifiers to check if the file exists and to check if the user that is buying the song is not the same one that uploaded it.

```js

    modifier isNotOwner(uint256 _id) {
        require(
            msg.sender != files[_id].owner,
            "You are the owner of this file"
        );
        _;
    }

    modifier fileExists(uint256 _id) {
        require(files.length >= _id, "The file does not exists");
        _;
    }

```
