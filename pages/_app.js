import styles from '../styles/globals.css'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'

import { WebBundlr } from '@bundlr-network/client'
import { providers, utils, Contract } from 'ethers'
import { useState, useRef } from 'react'
import { MainContext } from '../globalContext'
import MusicMarketplace from '../artifacts/solidity/contracts/MusicMarketplace.sol/MusicMarketplace.json'

import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }) {
  const [bundlrInstance, setBundlrInstance] = useState()
  const [bundlrBalance, setbundlrBalance] = useState(0)
  const [balance, setBalance] = useState(0)
  const [address, setAddress] = useState()
  const [contract, setContract] = useState()
  const [contractGetter, setContractGetter] = useState()

  const [songs, setSongs] = useState([])
  const [error, setError] = useState()

  const [URI, setURI] = useState()
  const [fileUploaded, setFileUploaded] = useState(false)
  const [metadataSaved, setMetadataSaved] = useState(false)

  const [showAppMessage, setShowAppMessage] = useState(false)
  const [appMessage, setAppMessage] = useState('')
  const [appMessageIsError, setAppMessageIsError] = useState(false)

  const router = useRouter()

  // polygon mainnet '0x89'
  // polygon mumbai '0x13881'
  // localhost '0x7a69'
  // localhost 1337 '0x539'
  const targetNetworkId = process.env.NEXT_PUBLIC_TARGET_NETWORK

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0'

  let provider

  // set the base currency as matic
  const [currency, setCurrency] = useState('matic')
  const bundlrRef = useRef()
  const contractRef = useRef()

  /**
   * Connects user's Metamask, initialise bundlr ineterface,
   * contract interface and retrieves balances
   */
  async function initWallet() {
    if (!window.ethereum) return

    await window.ethereum.enable()

    const networkOk = await checkNetwork()
    if (!networkOk) return

    provider = new providers.Web3Provider(window.ethereum)
    await provider._ready()

    console.log('Provider Ready! > ', provider)

    // load Bundlr endpoint from env or use testnet by default
    // Mainnet is: 'https://node1.bundlr.network'
    // Testnet is: 'https://testnet1.bundlr.network',
    const bundlrEndpoint =
      process.env.NEXT_PUBLIC_BUNDLR_ENDPOINT ||
      'https://testnet1.bundlr.network'

    const bundlr = new WebBundlr(bundlrEndpoint, currency, provider)
    await bundlr.ready()
    console.log('Bundlr provider ready')

    setBundlrInstance(bundlr)
    bundlrRef.current = bundlr
    await initContractInterface()
    await fetchBalance()
    // redirect to browse page
    router.push('/browse')
  }

  async function initContractInterface() {
    const signer = provider.getSigner()
    const metamaskAddress = await signer.getAddress()
    console.log('metamaskAddress', metamaskAddress)
    setAddress(metamaskAddress)
    const contract = new Contract(contractAddress, MusicMarketplace.abi, signer)
    const contractG = new Contract(
      contractAddress,
      MusicMarketplace.abi,
      provider
    )
    setContract(contract)
    setContractGetter(contractG)
    contractRef.current = contractG
  }

  function accShort() {
    if (!address) return
    return `${address.slice(0, 2)}...${address.slice(-4)}`
  }

  // get the user's bundlr balance
  async function fetchBalance() {
    const bal = await bundlrRef.current.getLoadedBalance()
    // console.log('bal', bal)
    console.log('bundlr balance: ', utils.formatEther(bal.toString()))
    setbundlrBalance(utils.formatEther(bal.toString()))
    // setAddress(bundlrRef.current.address)
    const balance = await provider.getBalance(bundlrRef.current.address)
    console.log('balance : ', utils.formatEther(balance.toString()))
    setBalance(utils.formatEther(balance.toString()))
  }

  // checks if current chain matches with the target
  async function checkNetwork() {
    console.log(`Target network is ${targetNetworkId}`)
    if (window.ethereum) {
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId',
      })
      console.log('Current network  :>> ', currentChainId)

      if (currentChainId != targetNetworkId) {
        // prompt to swith network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetNetworkId }],
          })
        } catch (error) {
          alert('Wrong network!')
          return false
        }
      }
      return true
    }
  }

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

  function clearNotification() {
    setShowAppMessage(false)
    setAppMessage('')
    setAppMessageIsError(false)
  }

  return (
    <div>
      <Head>
        <title>Decentralised Music Marketplace</title>
        <meta
          name="description"
          content="Sell your music using Arweave and Polygon"
        />
        <link rel="icon" href="/favicon.ico" />

        <meta
          property="og:url"
          content="https://arweave-music-marketplace.vercel.app/"
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Decentralised Music Marketplace" />
        <meta
          property="og:description"
          content="Sell your music using Arweave and Polygon"
        />
        <meta property="og:image" content="/music-og.jpeg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:domain"
          content="arweave-music-marketplace.vercel.app"
        />
        <meta
          property="twitter:url"
          content="https://arweave-music-marketplace.vercel.app/"
        />
        <meta name="twitter:title" content="Decentralised Music Marketplace" />
        <meta
          name="twitter:description"
          content="Sell your music using Arweave and Polygon"
        />
        <meta name="twitter:image" content="/music-og.jpeg" />
      </Head>
      <div className="flex flex-col h-screen justify-between">
        <nav className="w-full p-4 flex justify-around mb-8">
          {bundlrInstance && (
            <div className="flex items-center justify-between sm:items-stretch sm:justify-start gap-8">
              <Link href="/dashboard">
                <a className="  text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-white hover:border-b-2 hover:border-blue-700 text-sm font-medium">
                  Dashboard
                </a>
              </Link>

              <Link href="/browse">
                <a className=" text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-white hover:border-b-2 hover:border-blue-700 text-sm font-medium">
                  Browse
                </a>
              </Link>
              <span className="text-base">Acc {accShort()}</span>
            </div>
          )}
        </nav>
        <main className="max-w-7xl mx-auto text-center mb-auto">
          <h1 className="text-4xl font-bold mb-2">
            Decentralized music marketplace
          </h1>
          <h2 className="text-xl font-medium mb-12">
            powered by{' '}
            <span className="text-blue-500">Arweave, Bundlr & Polygon!</span>
          </h2>
          <p className="text-lg font-medium text-blue-600 mb-4">
            List your MP3 files and sell them with no royalties
          </p>
          {showAppMessage && (
            <div className="px-12 pb-12">
              <div
                className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline mr-8">{appMessage}</span>
                <button
                  className="absolute top-0 bottom-0 right-0 ml-12"
                  onClick={clearNotification}
                >
                  <svg
                    className="fill-current h-6 w-6 text-blue-500"
                    role="button"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <title>Close</title>
                    <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {/* wraps Component in MainContext to share app state */}
          <MainContext.Provider
            value={{
              initWallet,
              bundlrInstance,
              balance,
              fetchBalance,
              address,
              bundlrBalance,
              contract,
              contractGetter,
              showAppMessage,
              setShowAppMessage,
              appMessage,
              setAppMessage,
              setAppMessageIsError,
              songs,
              setSongs,
              getSongs,
              URI,
              setURI,
              fileUploaded,
              setFileUploaded,
              metadataSaved,
              setMetadataSaved,
            }}
          >
            <Component {...pageProps} />
          </MainContext.Provider>
        </main>
        <footer className="text-right p-2 border-t pt-4 px-2 text-blue-500">
          <a
            href="https://chainstack.com?utm_source=arweave_music_marketplace"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.logo}>
              Powered by{' '}
              <Image
                src="/chainstack.png"
                alt="Chainstack Logo"
                width={150}
                height={25}
              />
            </span>
          </a>
        </footer>
      </div>
    </div>
  )
}

export default MyApp
