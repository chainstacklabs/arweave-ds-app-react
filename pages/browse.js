import { MainContext } from '../globalContext'

import Head from 'next/head'

import Song from '../components/Song'

import { useEffect, useContext } from 'react'

import Router from 'next/router'

export default function Browse() {
  const { bundlrInstance, songs, getSongs } = useContext(MainContext)

  // when app loads, fetch songs
  useEffect(() => {
    if (!bundlrInstance) Router.push('/')

    getSongs()
  }, [])

  return (
    // Render list of songs
    <div>
      <Head>
        <title>Browse | Music marketplace</title>
      </Head>
      <h2 className="my-4 font-medium text-2xl">🎶 Songs listed to sale</h2>
      <p className="text-sm mb-4">
        There are {songs.length} songs listed to sell
      </p>
      <div className="container mx-auto grid md:grid-cols-3 gap-4 mt-12">
        {songs.length > 0 && songs.map((s) => <Song song={s} key={s} />)}
      </div>
    </div>
  )
}
