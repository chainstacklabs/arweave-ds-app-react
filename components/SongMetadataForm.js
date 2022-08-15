import { useContext, useState } from 'react'
import { MainContext } from '../globalContext'

import { utils } from 'ethers'

// to redirect after upload
import Router from 'next/router'

export default function SongMetadataForm({ URI }) {
  const { contract, setMetadataSaved, setURI, setFileUploaded } =
    useContext(MainContext)

  const [sellPrice, setSellPrice] = useState()
  const [title, setTitle] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  // save the song metadata to Smart Contract
  async function saveFileMetadata() {
    try {
      if (!URI || !title || !sellPrice) return
      setIsLoading(true)

      console.log(
        `Listing song ${title} for ${utils.parseUnits(
          sellPrice,
          18
        )} and URI ${URI}`
      )
      console.log('contract >>', contract)
      // save info in contract
      const tx = await contract.listSong(
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

      setIsLoading(false)
      // update global state
      setMetadataSaved(true)

      const files = await contract.getSongs()
      console.log('files', files)
      // redirect to browse page
      Router.push('/browse')
    } catch (err) {
      console.log('Error saving metadata: ', err)

      setIsLoading(false)
    }
  }
  return (
    <div>
      <div className="pb-16">
        <p className="mb-4 text-blue-600">
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
        <div className="max-w-xl mx-auto">
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
            Price in MATIC
          </label>
          <div className="mt-1 mb-6 w-32 mx-auto">
            <input
              type="text"
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
          {isLoading ? 'In progress...' : 'List for sale'}
        </button>
      </div>
    </div>
  )
}
