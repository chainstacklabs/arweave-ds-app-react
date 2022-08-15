import { useContext, useState } from 'react'
import { MainContext } from '../globalContext'

// to redirect after upload
import Router from 'next/router'

import { utils } from 'ethers'

export default function ArweaveUpload({}) {
  const {
    balance,
    bundlrInstance,
    currency,
    setCurrency,
    bundlrBalance,
    contract,
    URI,
    setURI,
  } = useContext(MainContext)

  const [file, setFile] = useState()

  const [localFile, setLocalFile] = useState()
  const [fileUploaded, setFileUploaded] = useState(false)

  const [fileCost, setFileCost] = useState()

  const [isLoading, setIsLoading] = useState(false)

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

  async function checkUploadCost(bytes) {
    if (bytes) {
      const cost = await bundlrInstance.getPrice(bytes)
      console.log('cost is:', cost.toString())
      setFileCost(utils.formatEther(cost.toString()))

      if (cost.isGreaterThan(bundlrBalance)) {
        console.log('not enough balance')
      } else {
        console.log('enough balance')
      }
    }
  }

  // upload the  file to Arweave
  async function uploadFile() {
    setIsLoading(true)
    if (!file) return
    const tags = [
      { name: 'Content-Type', value: 'audio/mpeg3' },
      { name: 'App-Name', value: 'DROP_N_SELL' },
    ]
    try {
      if (bundlrBalance < fileCost) {
        console.log('Insufficient funds in Bundlr, funding...')
        await fundBundlr(fileCost)
      }
      let tx = await bundlrInstance.uploader.upload(file, tags)
      setURI(`http://arweave.net/${tx.data.id}`)
      setFileUploaded(true)
      setIsLoading(false)
    } catch (err) {
      console.log('Error uploading file: ', err)
      setIsLoading(false)
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

  return (
    <div>
      <div className="w-64 h-48 mb-12 justify-center flex items-center rounded-lg border text-center mx-auto cursor-pointer">
        <input
          type="file"
          className="hidden"
          accept="audio/mpeg3"
          name="file"
          id="file"
          onChange={onFileChange}
        ></input>
        <label
          htmlFor="file"
          className="text-gray-500 cursor-pointer w-full h-full py-20"
        >
          {localFile ? 'Replace song' : 'Add song'}
        </label>
      </div>
      <div className="flex flex-col space-y-4 justify-center items-center">
        {localFile && !fileUploaded && <p>Uploading file: {localFile}</p>}

        {/* display calculated upload cast */}
        {fileCost && !fileUploaded && (
          <div className="py-8 ">
            <div className="mb-8 space-y-1">
              <p className="text-sm ">
                Cost to upload: {Math.round(fileCost * 1000) / 1000} MATIC
              </p>
              <p className="text-sm">
                Your wallet balance is: {Math.round(balance * 100) / 100} MATIC
              </p>
              <p className="text-sm">
                Your bundlr balance is: {Math.round(bundlrBalance * 100) / 100}{' '}
                MATIC
              </p>
            </div>
            <button
              className="w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={uploadFile}
            >
              {isLoading ? 'In progress...' : 'Upload song'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
