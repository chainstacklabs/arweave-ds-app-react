import { utils } from 'ethers'

export default function File({ file }) {
  async function buyFile() {
    try {
      console.log(`Buying file ${id}`)
      const tx = await contract.buyFile(file.id, { value: file.price })
      console.log('tx', tx)
      const res = await tx.wait()
      console.log('res', res)
    } catch (err) {
      console.error(err)
      setError(err.message)
    }
  }

  return (
    <div className="p-4 border mb-4 rounded-lg">
      <div className="">
        <h4 className="text-xl font-medium">{file.title}</h4>
        <p className="text-base">Price: {utils.formatEther(file.price)}</p>
      </div>
      {/* <p className="text-base">{file.description}</p> */}
      <button
        className="w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => buyFile()}
      >
        Buy file
      </button>
      <p className="text-sm my-4">{file.buyers.length} buyers</p>
    </div>
  )
}
