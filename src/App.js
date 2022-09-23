import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [location, setLocation] = useState(null)
  const [searchInput, setSearchInput] = useState(null)
  const [weather, setWeather] = useState(JSON.parse(localStorage.getItem("weatherCache"))?.expires >= Date.now() ? JSON.parse(localStorage.getItem("weatherCache")) : null)
  const [style, setStyle] = useState({background: "gray"})
  const [recent, setRecent] = useState(JSON.parse(localStorage.getItem("recentLocations")))

  if(localStorage.getItem("recentLocations") === null) {localStorage.setItem("recentLocations", JSON.stringify([]))} 
  const updateRecent = (cityName) => {
    let recentCopy = [...recent]
    
    if(!recentCopy.includes(cityName)){
      recentCopy?.unshift(cityName)
      recentCopy.length = 4
      console.log(recentCopy)
      localStorage.setItem("recentLocations", JSON.stringify(recentCopy))
      return recentCopy
    }
    return recent
  }

  //t = top, m = middle, b = bottom
  //h = hue, s = saturation, l = lighting
  const createGradient = (th=0, mh=0, bh=0,
                          ts=0, ms=0, bs=0, 
                          tl=0, ml=0, bl=0) => {
    let backgrounGradient
    let style
    weather?.city.sunrise > 0 ?
      backgrounGradient = {top: {hue: 0, sat: 100, lig: 50 }, middle: {hue: 0,  sat: 44, lig: 25 }, bottom: {hue: 0,  sat: 0, lig: 0 }} :
      backgrounGradient = {top: {hue: 0,  sat: 50, lig: 30 }, middle: {hue: 0,  sat: 25, lig: 10 }, bottom: {hue: 0,  sat: 0, lig: 0 }}

    backgrounGradient = {
      top:    {...backgrounGradient.top   , hue: backgrounGradient.top.hue + th   , sat: backgrounGradient.top.sat + ts   , lig: backgrounGradient.top.lig + tl }, 
      middle: {...backgrounGradient.middle, hue: backgrounGradient.middle.hue + mh, sat: backgrounGradient.middle.sat + ms, lig: backgrounGradient.middle.lig + ml }, 
      bottom: {...backgrounGradient.bottom, hue: backgrounGradient.bottom.hue + bh, sat: backgrounGradient.bottom.sat + bs, lig: backgrounGradient.bottom.lig + bl }}
      
    style = {background: `linear-gradient(0deg, 
      hsl(${backgrounGradient?.bottom.hue},${backgrounGradient?.bottom.sat}%,${backgrounGradient?.bottom.lig}%) 0%, 
      hsl(${backgrounGradient?.middle.hue},${backgrounGradient?.middle.sat}%,${backgrounGradient?.middle.lig}%) 35%, 
      hsl(${backgrounGradient?.top.hue},${backgrounGradient?.top.sat}%,${backgrounGradient?.top.lig}%) 100%)`}
    
    return style
  }

  useEffect(()=>{
    if(location) return
    navigator.geolocation.getCurrentPosition(
      (pos)=>setLocation(pos),
      (err)=>console.warn(`ERROR(${err.code}): ${err.message}`),
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0
      })
  },[location])

  useEffect(()=>{
    if(!searchInput) return
    let searchArg = searchInput.charAt(0).toUpperCase() + searchInput.slice(1)
    //console.log(searchArg)
    const getWeather = async () => {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${searchArg}&cnt=1&appid=${process.env.REACT_APP_WEATHER_APK}`)
      const resjson = await res.json()
      if(resjson.cod === "200"){
        setWeather(resjson)
        setRecent(updateRecent(searchArg))
      } 
      else {toast(resjson.message)}
      setSearchInput(null)
    }
    getWeather()
    //eslint-disable-next-line react-hooks/exhaustive-deps
  },[searchInput])

  useEffect(()=>{
    //console.log(location)
    if(!location || weather) return
    const getWeather = async () => {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${location.coords.latitude}&lon=${location.coords.longitude}&cnt=1&appid=${process.env.REACT_APP_WEATHER_APK}`)
      const resjson = await res.json()
      //console.log(resjson)
      setWeather(resjson)
      const weatherCache = {...resjson, expires: Date.now() + 1200 * 1000}
      localStorage.setItem("weatherCache", JSON.stringify(weatherCache))
    }
    getWeather()
  },[location, weather])

  useEffect(()=>{
    switch (weather?.list[0].weather[0].main) {
      case "Thunderstorm":
        setStyle(createGradient(255,245,222))
        break;
      case "Drizzle":
      case "Clouds":
        setStyle(createGradient(200,200,200,0,-22,0,50))
        break;
      case "Rain":
        setStyle(createGradient(220,215,200,-10,10))
        break;
      case "Snow":
        setStyle(createGradient(200,200,200,0,-50,0,50,50))
        break;
      case "Mist":
      case "Smoke":
      case "Haze":
      case "Fog":
      case "Ash":
      case "Squall":
      case "Tornado":
        setStyle(createGradient(200,200,200,-100,-50,0,0,5))
        break;
      case "Dust":
      case "Sand":
        setStyle(createGradient(42,42,42,-70,-20))
        break;
      case "Clear":
        setStyle(createGradient(200,200,200,-20,-20,0,36,25))
        break;
      default:
        break;
    }
  //eslint-disable-next-line react-hooks/exhaustive-deps
  },[weather])

  return (
    <div className="App">
      <div className="back" style={style}>
        <ToastContainer
          autoClose={2000}
          theme={"dark"}
          hideProgressBar={true}
        />
        <div className="row">
        <div className="search-root">
          <input 
            className="search-input" 
            onKeyDown={(e)=>{if(e.key === "Enter"){setSearchInput(e.target.value)}}}
            placeholder="Input a city name and hit enter"
          ></input>
        </div>
          <img src={`https://openweathermap.org/img/wn/${weather?.list[0].weather[0].icon}@4x.png`} alt="weather icon"></img>
          <div className="col">
            <h1>{weather?.city?.name}</h1>
            <h2>{`${Math.round(weather?.list[0].main.temp-273.15)}°C`}</h2>
            <h2>{`Feels like ${Math.round(weather?.list[0].main.feels_like-273.15)}°C`}</h2>
            <h2>{weather?.list[0].weather[0].description}</h2>
            <h2>{`humidity: ${weather?.list[0].main.humidity}%`}</h2>
          </div>
        </div>
        <div className="recent-container">
          <h2>Recent locations</h2>
          <div className="recent-btns">
            <button className="recent-btn" onClick={()=>setSearchInput(recent[0])}>{recent[0]}</button>
            <button className="recent-btn" onClick={()=>setSearchInput(recent[1])}>{recent[1]}</button>
            <button className="recent-btn" onClick={()=>setSearchInput(recent[2])}>{recent[2]}</button>
            <button className="recent-btn" onClick={()=>setSearchInput(recent[3])}>{recent[3]}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
