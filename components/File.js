import { utils } from 'ethers'
import { useContext } from 'react'

import { MainContext } from '../globalContext'

export default function File({ file }) {
  const {
    contract,
    address,
    contractGetter,
    bundlrInstance,
    setAppMessage,
    setShowAppMessage,
    setAppMessageIsError,
  } = useContext(MainContext)

  function accShort() {
    return `${file.owner.slice(0, 2)}...${file.owner.slice(-4)}`
  }

  function songButton() {
    console.log('Checking if file buyers include ', address)
    console.log('file.buyers: ', file.buyers)
    if (file.buyers.includes(address)) {
      console.log('Buyer found!')
      return (
        <a
          href=""
          className="w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Listen song
        </a>
      )
    }
    return (
      <button
        className="w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={buyFile}
      >
        Buy song
      </button>
    )
  }

  async function buyFile() {
    try {
      console.log(`Buying file ${file.id.toString()}`)
      const tx = await contract.buyFile(file.id.toString(), {
        value: file.price,
      })
      console.log('tx', tx)
      const res = await tx.wait()
      console.log('res', res)
      setAppMessage(
        'File bought! Check your dashboard to see how to download it.'
      )
      setShowAppMessage(true)
      setAppMessageIsError(false)
    } catch (err) {
      console.error(err)
      setAppMessage('Error buying file. Are you sure you are not the owner?')
      setShowAppMessage(true)
      setAppMessageIsError(true)
    }
  }

  return (
    <div className="p-4 border mb-4 rounded-lg flex flex-col space-y-4">
      <div className="">
        <h4 className="text-xl font-medium">
          {file.id.toString()} | {file.title}
        </h4>
        <p className="text-sm my-4">by {accShort()}</p>
        <p className="text-sm font-medium">
          Price: {utils.formatEther(file.price)}
        </p>
      </div>
      {songButton()}

      <p className="text-sm my-4">{file.buyers.length} buyers</p>
    </div>
  )
}
