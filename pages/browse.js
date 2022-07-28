import { query, arweave, createFileMeta } from '../arweave'
import { MainContext } from '../globalContext'

import Head from 'next/head'

import File from '../components/File'

import { useEffect, useState, useContext } from 'react'

import Router from 'next/router'

const wait = (ms) => new Promise((res) => setTimeout(res, ms))

export default function Browse() {
  const { contract, contractGetter, bundlrInstance } = useContext(MainContext)
  const [files, setFiles] = useState([])
  const [error, setError] = useState()

  // when app loads, fetch videos
  useEffect(() => {
    // if (!bundlrInstance) Router.push('/')
    // fetch listed files from contract
    async function getFiles() {
      try {
        const files = await contractGetter.getFiles()
        console.log('files retrieved: ', files)
        setFiles(files)
      } catch (error) {
        console.error('ERROR GETTING FILE LIST: ', error)
      }
    }
    getFiles()
  }, [])

  return (
    <div>
      <Head>
        <title>Browse | Drop & Sell</title>
        <meta
          name="description"
          content="Sell files using Arweave and Polygon"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h2 className="mb-4 font-medium text-2xl">Files listed to sale</h2>
      {error && <p>{error}</p>}
      <p className="text-sm mb-4">
        There are {files.length} files listed to sell
      </p>
      <div className="container mx-auto grid md:grid-cols-3 gap-4 mt-12">
        {files.length > 0 &&
          files.map((file) => <File file={file} key={file.id} />)}
      </div>
    </div>
  )
}
