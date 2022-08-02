import Head from 'next/head'

import { MainContext } from '../globalContext'

import { useState, useContext } from 'react'

import { utils } from 'ethers'

import { APP_NAME } from '../arweave'
import BoughtFiles from '../components/BoughtFiles'

export default function Home() {
  const {
    address,
    balance,
    bundlrInstance,
    initialiseBundlr,
    currency,
    setCurrency,
    bundlrBalance,
    contract,
  } = useContext(MainContext)

  // New local state variables
  const [file, setFile] = useState()
  const [localFile, setLocalFile] = useState()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileCost, setFileCost] = useState()
  const [sellPrice, setSellPrice] = useState()

  const [URI, setURI] = useState()

  const [fileUploaded, setFileUploaded] = useState(false)
  const [metadataSaved, setMetadataSaved] = useState(false)

  // when the file is uploaded, save to local state and calculate cost
  function onFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    checkUploadCost(file.size)
    if (file) {
      const lfile = URL.createObjectURL(file)
      setLocalFile(lfile)
      let reader = new FileReader()
      reader.onload = function (e) {
        if (reader.result) {
          setFile(Buffer.from(reader.result))
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  // save the  file to Arweave
  async function uploadFile() {
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
    } catch (err) {
      console.log('Error uploading file: ', err)
    }
  }

  async function fundBundlr(amount) {
    try {
      console.log('funding bundlr with: ', amount)
      const res = await bundlrInstance.fund(parseInt(amount))
      console.log('fund response: ', res)
    } catch (error) {
      console.error(error)
    }
  }

  async function checkUploadCost(bytes) {
    if (bytes) {
      const cost = await bundlrInstance.getPrice(bytes)
      console.log('cost is:', cost)
      setFileCost(utils.formatEther(cost.toString()))

      if (cost.isGreaterThan(bundlrBalance)) {
        console.log('not enough balance')
      } else {
        console.log('enough balance')
      }

      console.log('balance', balance)
      console.log('bundlrBalance', bundlrBalance)
      console.log('fileCost', fileCost)
      console.log('cost', cost)
    }
  }

  // save the video metadata to Smart Contract
  async function saveFileMetadata() {
    if (!URI || !title || !sellPrice) return

    // const amountFormatted =
    console.log(`Listing file ${title} for ${sellPrice}`)

    // save info in contract
    const tx = await contract.listFile(
      title,
      // sellPrice,
      utils.parseUnits(sellPrice, 18),
      URI
    )
    console.log('tx', tx)
    const res = await tx.wait()
    console.log('res', res)

    // reset everything in form
    setTitle('')
    setSellPrice('')
    setURI('')
    setFileUploaded(false)

    const files = await contract.getFiles()
    console.log('files', files)
  }

  return (
    <div className=" ">
      <Head>
        <title>Dashboard | Drop & Sell</title>
        <meta
          name="description"
          content="Sell files using Arweave and Polygon"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="">
        {bundlrInstance ? (
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
            <div className="w-64 h-48 mb-12 justify-center flex items-center rounded-lg border text-center mx-auto cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="audio/mpeg3"
                name="file"
                id="file"
                onChange={onFileChange}
              ></input>
              <label htmlFor="file" className="text-gray-500 cursor-pointer">
                Drop files here
              </label>
            </div>
            <div className="flex flex-col space-y-4 justify-center items-center">
              {localFile && !fileUploaded && <p>Uploading file: {localFile}</p>}

              {/* display calculated upload cast */}
              {fileCost && !fileUploaded && (
                <div className="pb-8">
                  <p className="text-sm mb-4">
                    Cost to upload: {Math.round(fileCost * 1000) / 1000} MATIC
                  </p>
                  <button
                    className="w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={uploadFile}
                  >
                    Upload File
                  </button>
                </div>
              )}
              {/* if there is a URI, then show the form to upload it */}
              {URI && !metadataSaved && (
                <div className="pb-16">
                  <p className="mb-4">
                    File uploaded to{' '}
                    <a
                      className="hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={URI}
                    >
                      {URI}
                    </a>
                  </p>
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Title
                    </label>
                    <div className="mt-1 mb-4">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="My awesome file"
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Price in Matic
                    </label>
                    <div className="mt-1 mb-6">
                      <input
                        type="number"
                        name="Price"
                        id="description"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="12"
                        onChange={(e) => setSellPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    onClick={saveFileMetadata}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    List for sale
                  </button>
                </div>
              )}
            </div>

            <BoughtFiles />
          </div>
        ) : (
          <div className="">
            <button
              type="button"
              onClick={initialiseBundlr}
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
        )}
      </div>
    </div>
  )
}
