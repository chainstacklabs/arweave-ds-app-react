import { useEffect, useState, useContext } from 'react'
import { MainContext } from '../globalContext'

export default function OwnedFiles() {
  const { contract, contractGetter, bundlrInstance } = useContext(MainContext)
  const [ownedFiles, setOwnedFiles] = useState()

  // when app loads, fetch videos
  useEffect(() => {
    getOwnedFiles()
  }, [])

  async function getOwnedFiles() {
    try {
      const files = await contractGetter.getOwnedFiles()
      console.log('owned files', files)
      setOwnedFiles(files)
    } catch (error) {
      console.error('ERROR GETTING FILES INFO', error)
    }
  }

  return (
    <div>
      <h2 className="my-16 text-2xl font-medium">Owned Files</h2>
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
              <button
                className="w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => buyFile(file.id, file.price)}
              >
                Buy file
              </button>
              <p className="text-sm my-4">{file.buyers.length} buyers</p>
            </div>
          ))}
      </div>
    </div>
  )
}
