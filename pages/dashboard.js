import Head from 'next/head'

import { MainContext } from '../globalContext'

import { useState, useContext, useEffect } from 'react'

// import { utils } from 'ethers'

// import { APP_NAME } from '../arweave'
import Router from 'next/router'
import ArweaveUpload from '../components/ArweaveUpload'
import SongMetadataForm from '../components/SongMetadataForm'

export default function Home() {
  const { balance, bundlrInstance, bundlrBalance, contract, URI } =
    useContext(MainContext)

  // redirect to home if no wallet connected
  useEffect(() => {
    if (!bundlrInstance) Router.push('/')
  }, [])

  // New local state variables
  // const [file, setFile] = useState()
  // const [localFile, setLocalFile] = useState()
  // const [title, setTitle] = useState('')
  // const [description, setDescription] = useState('')
  // const [fileCost, setFileCost] = useState()
  // const [sellPrice, setSellPrice] = useState()
  // const [isLoading, setIsLoading] = useState(false)

  // const [URI, setURI] = useState()
  // const [fileUploaded, setFileUploaded] = useState(false)
  // const [metadataSaved, setMetadataSaved] = useState(false)

  // // when the file is uploaded, save to local state and calculate cost
  // function onFileChange(e) {
  //   const file = e.target.files[0]
  //   if (!file) return
  //   checkUploadCost(file.size)
  //   if (file) {
  //     const lfile = URL.createObjectURL(file)
  //     setLocalFile(lfile)
  //     let reader = new FileReader()
  //     reader.onload = function (e) {
  //       if (reader.result) {
  //         setFile(Buffer.from(reader.result))
  //       }
  //     }
  //     reader.readAsArrayBuffer(file)
  //   }
  // }

  // // save the  file to Arweave
  // async function uploadFile() {
  //   setIsLoading(true)
  //   if (!file) return
  //   const tags = [
  //     { name: 'Content-Type', value: 'audio/mpeg3' },
  //     { name: 'App-Name', value: APP_NAME },
  //   ]
  //   try {
  //     if (bundlrBalance < fileCost) {
  //       console.log('Insufficient funds in Bundlr, funding...')
  //       await fundBundlr(fileCost)
  //     }
  //     let tx = await bundlrInstance.uploader.upload(file, tags)
  //     setURI(`http://arweave.net/${tx.data.id}`)
  //     setFileUploaded(true)
  //     setIsLoading(false)
  //   } catch (err) {
  //     console.log('Error uploading file: ', err)
  //     setIsLoading(false)
  //   }
  // }

  // async function fundBundlr(amount) {
  //   try {
  //     console.log('funding bundlr with: ', amount)
  //     const res = await bundlrInstance.fund(parseInt(amount))
  //     console.log('fund response: ', res)
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  // async function checkUploadCost(bytes) {
  //   if (bytes) {
  //     const cost = await bundlrInstance.getPrice(bytes)
  //     console.log('cost is:', cost)
  //     setFileCost(utils.formatEther(cost.toString()))

  //     if (cost.isGreaterThan(bundlrBalance)) {
  //       console.log('not enough balance')
  //     } else {
  //       console.log('enough balance')
  //     }

  //     console.log('balance', balance)
  //     console.log('bundlrBalance', bundlrBalance)
  //     console.log('fileCost', fileCost)
  //     console.log('cost', cost)
  //   }
  // }

  // // save the video metadata to Smart Contract
  // async function saveFileMetadata() {
  //   if (!URI || !title || !sellPrice) return
  //   setIsLoading(true)

  //   console.log(`Listing file ${title} for ${sellPrice}`)

  //   // save info in contract
  //   const tx = await contract.listSong(
  //     title,
  //     // sellPrice,
  //     utils.parseUnits(sellPrice, 18),
  //     URI
  //   )
  //   console.log('tx', tx)
  //   const res = await tx.wait()
  //   console.log('res', res)

  //   // reset everything in form
  //   setTitle('')
  //   setSellPrice('')
  //   setURI('')
  //   setFileUploaded(false)
  //   setIsLoading(false)

  //   const files = await contract.getSongs()
  //   console.log('files', files)
  //   // redirect to browse page
  //   Router.push('/browse')
  // }

  return (
    <div className=" ">
      <Head>
        <title>Dashboard | DMM</title>
        <meta
          name="description"
          content="Sell music using Arweave and Polygon"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="">
        <div className="w-full flex flex-col ">
          <div className="my-12">
            <p className="mb-4">
              Drop an MP3 file to upload it to. Once uploaded, enter the title
              and price to list if for sale on Polygon.
            </p>
            {/* <p>Connected {address}</p> */}
            <p className="text-sm">
              Your wallet balance is: {Math.round(balance * 100) / 100}
            </p>
            <p className="text-sm">
              Your bundlr balance is: {Math.round(bundlrBalance * 100) / 100}
            </p>
          </div>
          {!URI && <ArweaveUpload />}

          {/* if there is a URI, we've uploaded the song, then show the form to 
          enter the song metadata it */}
          {URI && <SongMetadataForm URI={URI} />}

          {/* <BoughtFiles /> */}
        </div>
      </div>
    </div>
  )
}
