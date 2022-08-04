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

  useEffect(() => {
    getSongURL()
  }, [])

  const [isLoading, setIsLoading] = useState(false)

  const [songURL, setSongURL] = useState('')
  const [canPlay, setCanPlay] = useState(false)

  async function getSongURL() {
    try {
      const songURL = await contract.getDownloadLink(song.id)
      console.log('songURL', songURL)
      setSongURL(songURL)

      await getSongs()
      userCanPlay()
    } catch (e) {
      console.log('e >> ', e)
    }
  }

  function accShort() {
    return `${song.author.slice(0, 2)}...${song.author.slice(-4)}`
  }

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

  async function buySong() {
    try {
      setIsLoading(true)
      console.log(`Buying file ${song.id.toString()}`)
      const tx = await contract.buySong(song.id.toString(), {
        value: song.price,
      })
      console.log('tx', tx)
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
