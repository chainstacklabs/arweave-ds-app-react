import { query, arweave, createFileMeta } from '../arweave'
import { MainContext } from '../globalContext'

import Head from 'next/head'

import File from '../components/File'

import { useEffect, useState, useContext } from 'react'
import { utils } from 'ethers'

import Router from 'next/router'

const wait = (ms) => new Promise((res) => setTimeout(res, ms))

export default function Browse() {
  const { contract, contractGetter, bundlrInstance } = useContext(MainContext)
  const [files, setFiles] = useState([])
  const [error, setError] = useState()

  // when app loads, fetch videos
  useEffect(() => {
    if (!bundlrInstance) Router.push('/')
    getFiles()
  }, [])

  // fetch data from Arweave
  // map over data and fetch metadata for each video then save to local state
  async function getFiles() {
    try {
      const files = await contractGetter.getFiles()
      console.log('files', files)
      setFiles(files)
    } catch (error) {
      console.error('ERROR GETTING FILES INFO', error)
    }
    // try {
    //   const results = await arweave.api.post('/graphql', query).catch((err) => {
    //     console.error('GraphQL query failed')
    //     throw new Error(err)
    //   })
    //   console.log('results', results)
    //   const edges = results.data.data.transactions.edges
    //   const files = await Promise.all(
    //     edges.map(async (edge) => await createFileMeta(edge.node))
    //   )
    //   console.log('files', files)
    //   let sorted = files.sort(
    //     (a, b) =>
    //       new Date(b.request.data.createdAt) -
    //       new Date(a.request.data.createdAt)
    //   )
    //   sorted = sorted.map((s) => s.request.data)
    //   setFiles(sorted)
    // } catch (err) {
    //   await wait(2 ** depth * 10)
    //   getPostInfo(topicFilter, depth + 1)
    //   console.log('error: ', err)
    // }
  }

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
      <h2 className="mb-12 font-medium text-2xl">Files listed to sale</h2>
      {error && <p>{error}</p>}
      <div className="container mx-auto grid md:grid-cols-3 gap-4 ">
        {files.length > 0 &&
          files.map((file) => <File file="file" key={file.id} />)}
      </div>
    </div>
  )
}
