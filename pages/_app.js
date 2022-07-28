import styles from '../styles/globals.css'
import Image from 'next/image'
import Link from 'next/link'

import { WebBundlr } from '@bundlr-network/client'
import { providers, utils, Contract } from 'ethers'
import { useState, useRef } from 'react'
import { MainContext } from '../globalContext'
import DropAndSell from '../artifacts/solidity/contracts/DropAndSell.sol/DropAndSell.json'

function MyApp({ Component, pageProps }) {
  const [bundlrInstance, setBundlrInstance] = useState()
  const [bundlrBalance, setbundlrBalance] = useState(0)
  const [balance, setBalance] = useState(0)
  const [address, setAddress] = useState()
  const [contract, setContract] = useState()
  const [contractGetter, setContractGetter] = useState()

  const [ownedFiles, setOwnedFiles] = useState()

  // polygon mainner
  // const targetNetworkId = '0x89'
  // polygon mumbai testnet
  // const targetNetworkId = '0x13881'
  // localhost
  const targetNetworkId = '0x7a69'

  const contractAddress =
    process.env.CONTRACT_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
  // '0x5FbDB2315678afecb367f032d93F642f64180aa3'

  let provider

  // set the base currency as matic (this can be changed later in the app)
  const [currency, setCurrency] = useState('matic')
  const bundlrRef = useRef()
  const contractRef = useRef()

  // create a function to connect to bundlr network
  async function initialiseBundlr() {
    if (!window.ethereum) return

    await window.ethereum.enable()

    const networkOk = await checkNetwork()
    if (!networkOk) return

    provider = new providers.Web3Provider(window.ethereum)
    await provider._ready()

    console.log('Provider Ready! > ', provider)
    const signer = provider.getSigner()

    const bundlr = new WebBundlr(
      // 'https://node1.bundlr.network',
      'https://testnet1.bundlr.network',
      currency,
      provider
    )
    await bundlr.ready()
    console.log('Bundlr provider ready')

    setBundlrInstance(bundlr)
    bundlrRef.current = bundlr
    await initContractInterface()
    await fetchBalance()
    await getOwnedFiles()
  }

  async function initContractInterface() {
    const signer = provider.getSigner()
    const contract = new Contract(contractAddress, DropAndSell.abi, signer)
    const contractG = new Contract(contractAddress, DropAndSell.abi, provider)
    setContract(contract)
    setContractGetter(contractG)
    contractRef.current = contractG
  }

  // get the user's bundlr balance
  async function fetchBalance() {
    const bal = await bundlrRef.current.getLoadedBalance()
    // console.log('bal', bal)
    console.log('bundlr balance: ', utils.formatEther(bal.toString()))
    setbundlrBalance(utils.formatEther(bal.toString()))
    setAddress(bundlrRef.current.address)
    const balance = await provider.getBalance(bundlrRef.current.address)
    console.log('balance : ', utils.formatEther(balance.toString()))
    setBalance(utils.formatEther(balance.toString()))
  }

  async function getOwnedFiles() {
    try {
      console.log('Retrieving bought files')
      console.log('contractGetter >> ', contractRef.current)
      const files = await contractRef.current.getBoughtFiles()
      console.log('owned files', files)
      setOwnedFiles(files)
    } catch (error) {
      console.error('ERROR GETTING FILES INFO', error)
    }
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
          // refresh
          // window.location.reload()
        } catch (error) {
          alert('Connect to Polygon Mainnet')
          return false
        }
      }
      return true
    }
  }

  const switchOrAdd = () => {
    props.isNewNetwork ? addNetwork() : switchNetwork()
  }

  return (
    <div className="flex flex-col h-screen justify-between">
      <nav className="w-full p-4 flex justify-around mb-8">
        <a
          href="https://chainstack.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className={styles.logo}>
            <Image
              src="/chainstack.png"
              alt="Chainstack Logo"
              width={150}
              height={25}
            />
          </span>
        </a>
        <div className="flex items-center justify-between sm:items-stretch sm:justify-start gap-8">
          <Link
            href="/"
            className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            aria-current="page"
          >
            Dashboard
          </Link>

          <Link
            href="/browse"
            className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
          >
            Browse
          </Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto text-center mb-auto">
        <h1 className="text-4xl font-bold mb-2">Drop & sell</h1>
        <h2 className="text-xl font-medium mb-12">
          powered by <span className="text-blue-500">Arweave + Polygon!</span>
        </h2>
        {/* wraps Component in MainContext to share app state */}
        <MainContext.Provider
          value={{
            initialiseBundlr,
            bundlrInstance,
            balance,
            fetchBalance,
            currency,
            setCurrency,
            address,
            bundlrBalance,
            contract,
            contractGetter,
            ownedFiles,
            getOwnedFiles,
          }}
        >
          <Component {...pageProps} />
        </MainContext.Provider>
      </main>
      <footer className="text-right p-2 border-t pt-4 px-2">
        <a
          href="https://chainstack.com"
          target="_blank"
          rel="noopener noreferrer"
        ></a>
        <span className={styles.logo}>
          <Image
            src="/chainstack.png"
            alt="Chainstack Logo"
            width={150}
            height={25}
          />
        </span>
      </footer>
    </div>
  )
}

export default MyApp
