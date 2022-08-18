import Head from 'next/head'

import { MainContext } from '../globalContext'

import { useContext, useEffect } from 'react'

import Router from 'next/router'
import ArweaveUpload from '../components/ArweaveUpload'
import SongMetadataForm from '../components/SongMetadataForm'

export default function Home() {
  const { bundlrInstance, URI } = useContext(MainContext)

  // redirect to home if no wallet connected
  useEffect(() => {
    if (!bundlrInstance) Router.push('/')
  }, [])

  return (
    <div className=" ">
      <Head>
        <title>Dashboard | Music marketplace</title>
      </Head>

      <div className="">
        <div className="w-full flex flex-col ">
          <div className="my-12">
            <p className="">
              <span className="text-blue-600 font-bold">1.</span> Select an MP3
              file and upload it to Arweave via Bundlr.
            </p>
            <p className="">
              <span className="text-blue-600 font-bold">2.</span> Once uploaded,
              enter the title and price to list if for sale.
            </p>
            <p className="">
              <span className="text-blue-600 font-bold">3.</span> Receive 100%
              of the sales
            </p>
          </div>
          {!URI && <ArweaveUpload />}

          {/* if there is a URI, we've uploaded the song, then show the form to 
          enter the song metadata */}
          {URI && <SongMetadataForm URI={URI} />}

          {/* <BoughtFiles /> */}
        </div>
      </div>
    </div>
  )
}
