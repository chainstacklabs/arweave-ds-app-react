# Building a decentralized music marketplace with Arweave and Polygon

File storage is one of those features required in most complex web apps. You're building an Instagram-like app? You need a file storage system for the photos. A Youtube-like app? You need that too. Almost any web2 app has a file storage system behind. And all those applications use services like AWS S3 or Cloudinary that provide an easy way to upload and query files through simple to use APIs.

However, these solutions have the same problem as any other web2 app: they're not decentralised.

In the web3 space there are multiple projects building decentralised data storage systems like IPFS, Filecoin and Arweave. In this article, we'll talk about the latter and explain **how to create a decentralised music marketplace that uses Arweave to store the song files.**

Ready? Let's get to it 🤘

## Arweave in a nutsell?

[Arweave](https://www.arweave.org/) is a decentralized storage network (DSN) and it allows users to upload any type of file and **pay a single fee at the time of uploading.** This is one of the key differences with other protocols like IPFS, where you have to make repeated payments to keep your files online.

In addition, Arweave stores data permanently, they're never deleted from the DSN. This has allowed different use cases, like the permaweb. You can use Arweave to host a website and, as the data is stored permanently, it'll never be censored so your website will always be available.

To upload files you need to pay using the Arweave native token, which you can buy from different exchanges. In this article, we'll follow a different route using Bundlr. Let's see how it works.

## Using Arweave with other tokens with Bundlr

[Bundlr](https://bundlr.network/) is a protocol build on top of Arweave that aims to solve some of Arweave's native limitations. **Using Bundlr you can upload files to Arweave paying with different tokens like ETH, SOL, MATIC or AVAX to name a few.** This gives users a lot more flexibility and opens up the protocol to users from all these different networks.

In addition, Bundlr uses bundles (😉) to reduce to cost of uploading files, and even makes **uploads free for files under 100kb.**

And finally, Bundlr provides [its own Javascript library](https://docs.bundlr.network/docs/client/js) that makes it super easy to interact with the protocol. Piece of cake 🍰

You can [learn more about Bundlr in their docs](https://docs.bundlr.network/docs/overview).

### Transfering funds to Bundlr

It's important to mention that **in order to upload files to Arweave using Bundlr, you need to transfer funds from you wallet to Bundlr.** You can do this in advance [using this app](https://demo.bundlr.network/) (not the greatest design but you can trust it) or you can do it programmatically following [this section of the docs](https://docs.bundlr.network/docs/client/examples/funding-your-account).

For the decentralised music marketplace I decided to follow the [lazy-funding approach](https://docs.bundlr.network/docs/client/examples/funding-your-account#lazy-funding). That means: check if the user has transfered the funds in advance and, if not (or if the funds are not enough), trigger the funding before actually uploading the file. Don't worry, we'll review that in detail later 😉

It's also worth mentioning that you can withdraw your funds from Bundlr to back to your wallet as well.

## Decentralized music marketplace overview

To showcase how to use Arweave and Bundlr, we're going to build a decentralized music marketplace app. Here is how it'll work:

- Users will be able to upload MP3 files and list them for sale by a price.
- The songs will be uploaded to Arweave via Bundlr and the metadata (title, price, author and download link) will be stored in a smart contract deployed in Polygon.
- Other users will bee able to browse listed songs and buy them paying with MATIC
- When a user buys a song, the MATIC will be sent to the author and the buyer will get a link to download the song or listen to it.

We'll limit this app to MP3 files. In addition, the songs will be bought and sold using MATIC only, but you can extend this app to work with other file types and multiple protocols if you want. We'll give you some ideas at the end of this article 😉

### Tech stack

To build this project we'll use the following tech stack:

- Solidity to write the smart contract.
- Javascript to write smart contract tests and deployment script.
- React / Next.js for the web app.

You can find the whole code for this app in [the following GitHub repository](https://github.com/chainstack/arweave-ds-app).

Let's start coding 👨🏻‍💻

### Smart contract

We need a smart contract to store the song's metadata: title, price, author and the each song's URL in Arweave.

As we don't want all users to be able to see the URL of every song, we'll separate these into two different mappings, one with the public information (title, price and author) and another one `private` with the URL.

```js

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract MusicMarketplace {
    // Song struct
    struct Song {
        uint256 id;
        uint256 price;
        address author;
        address[] buyers;
        string title;
    }
    // array that stores all songs
    Song[] songs;
    // stores all songs URLs
    mapping(uint256 => string) private songDownloadURLs;

    // events
    event SongListed(uint256 indexed id, string title, uint256 price);
    event SongSold(uint256 indexed id, address buyer);
    //....

}
```

To list a song for sale, users will provide a title, price and the URL of the file in Arweave. Then we'll just save that information in the `songs` and `songDownloadURLs` state variables as follows:

```js
     // save song info to songs array
 function listSong(
        string memory _title,
        uint256 _price,
        string memory _arweaveURI
    ) public {
        Song memory song;

        song.id = songs.length;
        // save price and other info to song struct
        song.price = _price;
        song.author = msg.sender;
        song.title = _title;
        // create memory array to store buyers and
        // include the author
        address[] memory buyers = new address[](1);
        buyers[0] = msg.sender;
        // save buyers to song struct
        song.buyers = buyers;
        // save to list of songs
        songs.push(song);

        // save the file's arweave URI in private mapping
        songDownloadURLs[song.id] = _arweaveURI;

        emit SongListed(song.id, _title, _price);
    }
```

Notice that we're also saving the owner using the `msg.sender` variable and that we're also including it in the `buyers` array. We're doing this to make sure an author does not have to buy his/her own songs and to simplify things for our frontend 😉

To buy a song, we'd need a payable function that receives the amount of MATIC and the song id that the user wants to buy. We also need to do a few checks, like making sure the song id provided exists, that the buyer is not the author of the song, and that the user has not bought the song already. For that, I created the following modifiers:

```js
    // check if song id exists
    modifier songExists(uint256 _id) {
        require(songs.length >= _id, "The song does not exist");
        _;
    }

    // checks if user is not the author of the song
    modifier isNotAuthor(uint256 _id) {
        require(
            msg.sender != songs[_id].author,
            "You are the author of this song"
        );
        _;
    }

    // checks if msg.sender is included in buyers list of song _id
    modifier isNotBuyer(uint256 _id) {
        require(songs[_id].buyers.length > 0, "The song has no buyers");

        bool userIsNotBuyer = true;
        for (uint256 x = 0; x < songs[_id].buyers.length; x++) {
            if (songs[_id].buyers[x] == msg.sender) {
                console.log("Found buyer: ", songs[_id].buyers[x]);
                userIsNotBuyer = false;
            }
        }
        require(userIsNotBuyer, "You already own this song");
        _;
    }

```

Then we can use them in our `buySong` function. It will check that the amount sent is valid, transfer the funds to the author of the song, and add the user's wallet address to the `buyers` array in the song mapping:

```js
 function buySong(uint256 _id)
        external
        payable
        songExists(_id)
        isNotAuthor(_id)
        isNotBuyer(_id)
    {
        // check if user sent enough funds
        require(msg.value >= songs[_id].price, "Not enough funds");

        // transfer funds
        address payable receiver = payable(songs[_id].author);
        (bool sent, ) = receiver.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        // add sender to buyers array
        songs[_id].buyers.push(msg.sender);

        emit SongSold(_id, msg.sender);
    }
```

The last important part of this contract is a function to retrieve the URL of the song's in Arweave. To run this song I created another modifier to make sure that only users that have actually bought the song can retrieve the URL:

```js
// checks if msg.sender is included in buyers list of song _id
    modifier isBuyer(uint256 _id) {
        require(songs[_id].buyers.length > 0, "The song has no buyers");

        bool userIsBuyer = false;
        for (uint256 x = 0; x < songs[_id].buyers.length; x++) {
            if (songs[_id].buyers[x] == msg.sender) {
                console.log("Found buyer: ", songs[_id].buyers[x]);
                userIsBuyer = true;
            }
        }
        require(userIsBuyer, "You do not own this song.");
        _;
    }
```

Then we can use this modifier in the `getDownloadLink` function, which then will be pretty simple as all the checks are done in the modifiers `songExists` and `isBuyer`:

```js
    function getDownloadLink(uint256 _id)
        public
        view
        songExists(_id)
        isBuyer(_id)
        returns (string memory)
    {
        // return url from state mapping
        return songDownloadURLs[_id];
    }
```

That covers most of the smart contract code. You can find the full code in [this file in the repository](https://github.com/chainstack/arweave-ds-app/blob/master/solidity/contracts/MusicMarketplace.sol) and [even some tests](https://github.com/chainstack/arweave-ds-app/blob/master/test/MusicMarketplace.spec.js) that you can run locally.

## Creating the web app

This build the web app I used [Next.js](https://nextjs.org/) with the [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) command. I separated it in three different pages:

- index: landing page with the button to connect Metamask.
- dashboard: page to upload song files and metadata.
- browse: page to browse available songs and listen to them.

As we'll access a lot of state variables from multiple pages, like a contract and wallet interfaces, so we'd need to define them in the app entry point file `_app.js` and use a context provider to share them throughout the rest of the pages. We

### Dependencies

Apart from the default Next.js dependencies, we'll need to use the Bundlr library to interact with Arweave through Bundlr. I also installed TailwindCSS to help styling the app.

- `@bundlr-network/client`: [library documentation](https://docs.bundlr.network/docs/client/js)
- `tailwindcss`: follow [installation guide here](https://tailwindcss.com/docs/installation)

### The landing page: connect wallet and fetch balance

[VIDEO LANDING PAGE CONNECT WALLET]

The landing page has just a button to connect the user's wallet that will trigger the `initWallet` below. As we'll be using Bundlr to interact with Arweave, we'll actually initialise a Bundlr intance using the Metamask provider, which is inyected in `window.ethereum` by default:

```js
let provider

// set the base currency as matic
const [currency, setCurrency] = useState('matic')

/**
 * Connects user's Metamask, initialise bundlr ineterface,
 * contract interface and retrieves balances
 */
async function initWallet() {
  // return if Metamask is not installed
  if (!window.ethereum) return

  await window.ethereum.enable()
  // check if current network is ok
  const networkOk = await checkNetwork()
  if (!networkOk) return
  // creates an Ethers provider from Metamask
  provider = new providers.Web3Provider(window.ethereum)
  await provider._ready()

  console.log('Provider Ready! > ', provider)

  // load Bundlr endpoint from env or use testnet by default
  // Mainnet is: 'https://node1.bundlr.network'
  // Testnet is: 'https://testnet1.bundlr.network',
  const bundlrEndpoint =
    process.env.NEXT_PUBLIC_BUNDLR_ENDPOINT || 'https://testnet1.bundlr.network'

  // initialise Bundlr wallet instance using the same provider
  const bundlr = new WebBundlr(bundlrEndpoint, currency, provider)
  await bundlr.ready()
  console.log('Bundlr provider ready')
  // saves Bundlr instance in app state
  setBundlrInstance(bundlr)
  bundlrRef.current = bundlr
  //
  await initContractInterface()
  // retrieves balance from Bundlr
  await fetchBalance()
  // redirect to browse page
  router.push('/browse')
}
```

With the `fetchBalance` function we will retrieve both the Metamask balance and the Bundlr balance so we can check if the user has enough funds to upload a song. Remember that we have to transfer funds to Bundlr to actually use it.

```js
// state variables to save balance
const [bundlrBalance, setbundlrBalance] = useState(0)
const [balance, setBalance] = useState(0)

// Retrieve the user's metamask and bundlr balances
async function fetchBalance() {
  // gets balance from Bundlr instance initialised earlier
  const bal = await bundlrRef.current.getLoadedBalance()
  console.log('Bundlr balance: ', utils.formatEther(bal.toString()))
  // parse balance to ETH format and save it in app state
  setbundlrBalance(utils.formatEther(bal.toString()))
  // retrieve balance from Metamask
  const balance = await provider.getBalance(bundlrRef.current.address)
  console.log('Metamask balance : ', utils.formatEther(balance.toString()))
  // parse balance to ETH format and save it in app state
  setBalance(utils.formatEther(balance.toString()))
}
```

### Dashboard page: uploading songs and listing them for sale

[VIDEO DASHBOARD PAGE UPLOAD]

To list a song for sale, users will need to send two transactions:

1. First, upload the song file to Arweave through Bundlr.
2. After that, save the song title and price in our smart contract.

That means our page will have two different forms. For that, I separated them in two different components, [`ArweaveUpload.js`]() and [`SongMetadataForm.js`]().

The `ArweaveUpload` component has a simple file input which I stlyed a little bit with TailwindCSS classes and a button that actually upload the file. When the user selects a file to upload, the application automatically checks the cost of uploading it to Arweave with the following method:

```js
/**
 * Check cost to upload file to Arweave via Bundlr
 */
async function checkUploadCost(bytes) {
  if (bytes) {
    const cost = await bundlrInstance.getPrice(bytes)
    console.log('cost is:', cost.toString())
    setFileCost(utils.formatEther(cost.toString()))

    if (cost.isGreaterThan(bundlrBalance)) {
      console.log('not enough balance')
    } else {
      console.log('enough balance')
    }
  }
}
```

Once the user knows the upload cost, he/she can click the upload button which will trigger the following `uploadFile` function:

```js
/**
 * upload the  file to Arweave using bundlrInstace from
 * global state
 */
async function uploadFile() {
  setIsLoading(true)
  if (!file) return
  const tags = [
    { name: 'Content-Type', value: 'audio/mpeg3' },
    { name: 'App-Name', value: APP_NAME },
  ]
  try {
    if (bundlrBalance < fileCost) {
      console.log('Insufficient funds in Bundlr, funding...')
      await fundBundlr(fileCost)
    }
    let tx = await bundlrInstance.uploader.upload(file, tags)
    setURI(`http://arweave.net/${tx.data.id}`)
    setFileUploaded(true)
    setIsLoading(false)
  } catch (err) {
    console.log('Error uploading file: ', err)
    setIsLoading(false)
  }
}
/**
 * transfers funds from the user's Metamask wallet to
 * his/her correspondent Bundlr account using bundlrInstance
 * from global state
 */
async function fundBundlr(amount) {
  try {
    console.log('funding bundlr with: ', amount)
    const res = await bundlrInstance.fund(parseInt(amount))
    console.log('fund response: ', res)
  } catch (error) {
    console.error(error)
  }
}
```

Notice that I'm checking if the Bundlr balance is enough to cover the upload cost and, if not, calling the `fundBundlr` function that will send an additional transaction to transfer funds from the user's Metamask wallet to their correspondent Bundlr account.

Once the `upload` transaction is settled, I'm saving the songs URI in the application global state using th default Arweave domain (http://arweave.net/) and the id returned by the upload transaction.

You can find all the code for the ArweaveUpload component in [the following file in GiHub](https://github.com/chainstack/arweave-ds-app/blob/master/components/ArweaveUpload.js).

Once the song is uploaded to Arweave, the next step is to **list it for sale by uploading the title, price and Arweave URL to our smart contract.**

For that, I created a separate component named [`SongMetadataForm`](https://github.com/chainstack/arweave-ds-app/blob/master/components/SongMetadataForm.js). It just contains to inputs for the title and sale price and a button that triggers the `saveFileMetadata` function:

```js
/**
 * saves the song metadata to Smart Contract using
 * contract instance and URI from global state
 */
async function saveFileMetadata() {
  try {
    if (!URI || !title || !sellPrice) return
    setIsLoading(true)

    console.log(
      `Listing song ${title} for ${utils.parseUnits(
        sellPrice,
        18
      )} and URI ${URI}`
    )
    // save info in contract
    const tx = await contract.listSong(
      title,
      // parses price to ETH format
      utils.parseUnits(sellPrice, 18),
      URI
    )
    // wait for transaction to settle
    const res = await tx.wait()
    console.log('res', res)

    // reset everything in form
    setTitle('')
    setSellPrice('')
    setURI('')
    setFileUploaded(false)
    setIsLoading(false)

    // update global state
    setMetadataSaved(true)

    // refresh list of songs listed for sale
    const files = await contract.getSongs()
    // redirect to browse page
    Router.push('/browse')
  } catch (err) {
    console.log('Error saving metadata: ', err)

    setIsLoading(false)
  }
}
```

This will request the user to sing another transaction and, once settled redirect the user to the browse page. As you can see we're also refreshing the list of songs in the global state by calling the `contract.getSongs()` method.

### Browse page: buying and listening songs

[VIDEO BROWSE PAGE]

Next step is to create the browse page in which users will be able to buy songs and listen/download them. So the first thing we need is a function to retrieve all the songs listed for sale from our smart contract. It'll look like this:

```js
export default function Browse() {

  const {
    bundlrInstance,
    songs,
    getSongs,
  } = useContext(MainContext)

  // when app loads, fetch songs
  useEffect(() => {
    if (!bundlrInstance) Router.push('/')

    getSongs()
  }, [])

  /**
   * fetchs songs listed for sale from the app smart contract
   */
  async function getSongs() {
    try {
      console.log('Retrieving songs')
      const songs = await contractGetter.getSongs()
      setSongs(songs)
    } catch (error) {
      console.error('ERROR GETTING FILE LIST: ', error)
    }
  }

  return (
    // Render list of songs
    <div className="container mx-auto grid md:grid-cols-3 gap-4 mt-12">
        {songs.length > 0 && songs.map((s) => <Song song={s} key={s} />)}
    </div>
  )
```

As we're calling this function from both the browse and the dashboard pages, I actually declared it in the app entry file (`_app.js`) and pass it down using a MainContext Provider 😉

To render each song I created a separate component named just `Song.js`. In it I'm displaying the song's title, price, number of buyers and a dynamic button that allows users to buy the song or, if they've already done it (or if they're the author), listen to it. Here is the code:

```js
import { utils } from 'ethers'
import { useContext, useState, useEffect } from 'react'

import { MainContext } from '../globalContext'

export default function Song({ song }) {
  const {
    contract,
    address,
    getSongs,
    setAppMessage,
    setShowAppMessage,
    setAppMessageIsError,
  } = useContext(MainContext)

  // tries to retrieve song URL on load
  useEffect(() => {
    getSongURL()
  }, [])

  const [isLoading, setIsLoading] = useState(false)

  const [songURL, setSongURL] = useState('')
  const [canPlay, setCanPlay] = useState(false)

  /**
   * Retrieves songURL from Arweave. Only author/buyers can
   * call this method of the smart contract
   */
  async function getSongURL() {
    try {
      const songURL = await contract.getDownloadLink(song.id)
      console.log('songURL', songURL)
      setSongURL(songURL)

      await getSongs()
      userCanPlay()
    } catch (e) {
      console.log('Error retrieving song URL >> ', e)
    }
  }

  function accShort() {
    return `${song.author.slice(0, 2)}...${song.author.slice(-4)}`
  }
  /**
   * Check if user is author or one of the buyers
   */
  function userCanPlay() {
    console.log('Checking if songs buyers include ', address)
    console.log('song.buyers: ', song.buyers)
    console.log('user address ', address)
    if (song.buyers.includes(address) || song.author == address) {
      console.log('Buyer / author found!')
      setCanPlay(true)
    } else {
      setCanPlay(false)
    }
  }
  /**
   * Buys song for user using the contract interface
   * from app global state
   */
  async function buySong() {
    try {
      setIsLoading(true)
      console.log(`Buying file ${song.id.toString()}`)
      // trigger buySong method from smart contract
      const tx = await contract.buySong(song.id.toString(), {
        value: song.price,
      })
      const res = await tx.wait()
      console.log('Transaction completed')
      setAppMessage('Song bought! You can listen it now 🎧🎶')
      setShowAppMessage(true)
      setAppMessageIsError(false)
      // refresh state to change play/buy button
      await getSongs()
      console.log('Songs refreshed')
      userCanPlay()
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      setAppMessage('Error buying song. Are you sure you are not the owner?')
      setShowAppMessage(true)
      setAppMessageIsError(true)
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border border-blue-100 hover:shadow-xl mb-4 rounded-lg flex flex-col space-y-4">
      <div className="">
        <h4 className="text-xl font-medium">
          <span className="text-base">{song.id.toString()}</span> | {song.title}
        </h4>
        <p className="text-sm my-4">by {accShort()}</p>
        <p className="text-sm font-medium">
          Price: {utils.formatEther(song.price)}
        </p>
      </div>
      {canPlay ? (
        <a
          className="w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          href={songURL}
          target="_blank"
        >
          Listen song
        </a>
      ) : (
        <button
          className="w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          onClick={buySong}
        >
          {isLoading ? 'In progress...' : 'Buy song'}
        </button>
      )}

      <p className="text-sm my-4">{song.buyers.length} buyers</p>
    </div>
  )
}
```

And with that, we have our decentralised music marketplace ready. You can find a working version of this app [in the following link]()

## What's next?

This app covers the basics of how to interact with Arweave using Bundlr and there are many things that you can do to extend this app. Here are a few ideas:

- Improve music player.
- Add a section in the dashboard with all the songs a user has uploaded.
- Extend the accepted currencies to stablecoins in Polygon.
- Deploy the contract to different blockchains like Avalanche or BSC and accept different cryptocurrencies.

Remember that you can find the full code of this app in [the following repository in GitHub](https://github.com/chainstack/arweave-ds-app), so feel free to fork it, use it for your own project, or create a PR to improve it!
