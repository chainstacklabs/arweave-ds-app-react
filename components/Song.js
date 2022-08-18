import { utils, BigNumber, FixedNumber } from 'ethers'
import { useContext, useState, useEffect } from 'react'

import { MainContext } from '../globalContext'

export default function Song({ song }) {
  const {
    contract,
    address,
    getSongs,
    balance,
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
      console.log('balance >> ', balance)
      console.log('song.price >> ', song.price)
      console.log('balance BN', FixedNumber.from(balance))
      if (song.price.gt(FixedNumber.from(balance))) {
        setAppMessage('You do not have enough funds to buy this song')
        setShowAppMessage(true)
        setAppMessageIsError(true)
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      console.log(`Buying song with id ${song.id.toString()}`)
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
      setAppMessage('Error buying song 🤕')
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
        <p className="text-sm mb-4">by {accShort()}</p>
        <p className="text-sm font-medium">
          Price: {utils.formatEther(song.price)} MATIC
        </p>
      </div>
      <p className="text-sm my-4">
        {song.author == address
          ? `You're the author`
          : `${song.buyers.length - 1} buyers`}
      </p>
      {canPlay ? (
        <div className="flex flex-col items-center gap-4">
          <audio controls>
            <source src={songURL} type="audio/mpeg"></source>
          </audio>
          <a
            className="w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            href={songURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download song
          </a>
        </div>
      ) : (
        <button
          className="w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          onClick={buySong}
        >
          {isLoading ? 'In progress...' : 'Buy song'}
        </button>
      )}
    </div>
  )
}
