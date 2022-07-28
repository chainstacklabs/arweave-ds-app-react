import { useEffect, useState, useContext } from 'react'
import { MainContext } from '../globalContext'

export default function OwnedFiles() {
  const {
    contract,
    contractGetter,
    bundlrInstance,
    ownedFiles,
    getOwnedFiles,
  } = useContext(MainContext)

  const wait = (ms) => new Promise((res) => setTimeout(res, ms))

  // when app loads, fetch files user has bought
  useEffect(() => {
    // getOwnedFiles()
  }, [])

  return (
    <div className="pb-16 pt-8 border-t">
      <h2 className="mt-16 mb-8 text-2xl font-medium">Owned Files</h2>
      <p>This is the list of files that you've already bought</p>
      <div className="container mx-auto grid md:grid-cols-3 gap-4 ">
        {ownedFiles &&
          ownedFiles.map((file) => (
            <div className="p-4 border mb-4 rounded-lg" key={file.id}>
              <div className="">
                <h4 className="text-xl font-medium">{file.title}</h4>
                <p className="text-base">
                  Price: {utils.formatEther(file.price)}
                </p>
              </div>
              {/* <p className="text-base">{file.description}</p> */}
              <a
                className="w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                href="#"
              >
                Download
              </a>
              <p className="text-sm my-4">{file.buyers.length} buyers</p>
            </div>
          ))}
      </div>
    </div>
  )
}
