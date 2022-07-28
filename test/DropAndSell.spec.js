const { expect } = require('chai')

const { ethers } = require('hardhat')

// Import utilities from Test Helpers
const {
  // BN,
  expectEvent,
  expectRevert,
  // constants,
} = require('@openzeppelin/test-helpers')

let dropsellcontract, dsFactory, owner, user1, user2, user3

describe('DropAndSell', () => {
  before(async function () {
    dsFactory = await ethers.getContractFactory('DropAndSell')
    ;[owner, user1, user2, user3] = await ethers.getSigners()
    // deploy contract with bridge address
    dropsellcontract = await dsFactory.deploy()
    await dropsellcontract.deployed()
  })
  it('returns all listed files', async () => {
    const files = await dropsellcontract.getFiles()
    expect(files.length).to.equal(0)
  })

  it('returns zero if user owns no files', async () => {
    const res = await dropsellcontract.getOwnedFiles()
    expect(res.length).to.equal(0)
  })

  it('allows users to list files', async () => {
    let res = await dropsellcontract.listFile(
      'Title',
      10,
      'http://arweave.com/123123'
    )
    // console.log('res', res)
    let files = await dropsellcontract.connect(user1).getFiles()

    expect(files.length).to.equal(1)

    res = await dropsellcontract.listFile(
      'Title Two',
      11,
      'http://arweave.com/12312334'
    )
    // console.log('res', res)
    files = await dropsellcontract.getFiles()
    // console.log('files', files)
    expect(files.length).to.equal(2)
  })

  it('fails if user tries to buy his own files', async () => {
    await expect(dropsellcontract.buyFile(0)).to.be.revertedWith(
      'You are the owner of this file'
    )
  })

  it('fails if user tries to buy file doesnt exists', async () => {
    await expect(
      dropsellcontract.connect(user1).buyFile(10)
    ).to.be.revertedWith('The file does not exists')
  })

  it('fails if user tries to buy paying less', async () => {
    await expect(
      dropsellcontract.connect(user2).buyFile(1, { value: 1 })
    ).to.be.revertedWith('Not enough funds')
  })
  it('allows user to buy file', async () => {
    await expect(
      dropsellcontract.connect(user1).getBoughtFiles()
    ).to.be.revertedWith('You bought no files')
    let tx = await dropsellcontract
      .connect(user1)
      .buyFile(0, { value: ethers.utils.parseEther('10') })
    // console.log('tx', tx)
    const owned = await dropsellcontract.connect(user1).getBoughtFiles()
    console.log('owned', owned)
    expect(owned.length).to.equal(1)
    const link = await dropsellcontract.connect(user1).getDownloadLink(0)
    console.log('link', link)
    expect(link).to.equal('http://arweave.com/123123')
  })
  it('prevents not buyers to check download link', async () => {
    await expect(dropsellcontract.getDownloadLink(0)).to.be.revertedWith(
      'You do not own this file.'
    )
  })
})
