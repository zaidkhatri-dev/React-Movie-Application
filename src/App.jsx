import { useEffect, useState } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import fn from './appwrite';

const API_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = import.meta.env.VITE_TMDB_API_KEY


const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState()
  const [trendingMovies, setTrendingMovies] = useState([])

  useDebounce(()=>{setDebouncedSearchTerm(searchTerm)},500,[searchTerm])

  const searchMovies = async (query = "") => {
    setIsLoading(true)
    setErrorMsg()
    
    try {
      const endpoint = query ? 
      `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` 
      : `${API_BASE_URL}/discover/movie?sortby=popularity.desc`
      const response = await fetch(endpoint,API_OPTIONS)


      if(!response.ok){
        throw new Error("Error")
      }

      const data = await response.json()
      

      if(data.Response == 'False'){
        setErrorMsg(data.Error || "Failed to fetch movies")
        setMovieList([])
        return;
      }

      setMovieList(data.results)

      if(query && data.results.length > 0){
        await fn.updateSearchCount(query, data.results[0])
      }

    } catch (error) {
      setErrorMsg("Error fetching Movies. Please try again later")
    }finally{
      setIsLoading(false)
    }
  }
  
  const getTrendingMovies = async () => {
    try {
      const movies = await fn.getTrending()
      
      setTrendingMovies(movies)
    } catch (error) {
      console.error(error)
    }
  } 

  useEffect(()=>{
    searchMovies(debouncedSearchTerm)
  },[debouncedSearchTerm])

  useEffect(()=>{
    getTrendingMovies()
  },[])
  
  return (
    <main className="bg-[url('BG.png')]">
      <div className='pattern'/>

      <div className='wrapper'>
        <header>
          <img src="hero-img.png" alt="" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}></Search>
        </header>

        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie,idx)=>(
                <li key={movie.$id}>
                  <p>{idx+1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}
        
        <section className='all-movies'>
          <h2>All Movies</h2>
          
          {isLoading ? (
            <Spinner></Spinner>
          ) : errorMsg ? (
            <p className='text-red-600'>{errorMsg}</p>
          ) : (
            <ul>
              {movieList.map(movie=>(
                <MovieCard key={movie.id} movie={movie}></MovieCard>
              ))}
            </ul>
          )}

        </section>
      </div>
    </main>
  )
}

export default App