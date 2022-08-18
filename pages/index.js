import Head from 'next/head'

import { MainContext } from '../globalContext'

import { useContext } from 'react'

export default function Home() {
  const { initWallet } = useContext(MainContext)

  return (
    <div className=" ">
      <Head>
        <title>Decentralised Music Marketplace</title>
        <meta
          name="description"
          content="Sell your music using Arweave and Polygon"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="">
        <div className="">
          <button
            type="button"
            onClick={initWallet}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="-ml-1 mr-3 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path
                fillRule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  )
}
