import React from 'react'

const Search = ({searchTerm, setSearchTerm}) => {
  return (
    <div className='text-3xl text-white'>
        <div className='search'>
            <div>
                <img src="search.svg" alt="seach-icon" />
                <input 
                type="text" 
                value={searchTerm}
                placeholder='Search from thousands of movies'
                onChange={(e)=>setSearchTerm(e.target.value)}
                />
            </div>
        </div>
    </div>
  )
}

export default Search