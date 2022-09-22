import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [location, setLocation] = useState(null)
  const [searchInput, setSearchInput] = useState(null)
  const [weather, setWeather] = useState(JSON.parse(localStorage.getItem("weatherCache"))?.expires >= Date.now() ? JSON.parse(localStorage.getItem("weatherCache")) : null)
  const [bgColor, setBgColor] = useState({
    top: { hue: 0, sat: 0, lig: 0 }, 
    middle: { hue: 0, sat: 0, lig: 0 }, 
    bottom: { hue: 0, sat: 0, lig: 0 }
  })
  const [style, setStyle] = useState(
    {background: `linear-gradient(0deg, 
      hsl(${bgColor?.bottom.hue},${bgColor?.bottom.sat}%,${bgColor?.bottom.lig}%) 0%, 
      hsl(${bgColor?.middle.hue},${bgColor?.middle.sat}%,${bgColor?.middle.lig}%) 35%, 
      hsl(${bgColor?.top.hue},${bgColor?.top.sat}%,${bgColor?.top.lig}%) 100%)`}
  )

  //t = top, m = middle, b = bottom
  //h = hue, s = saturation, l = lighting
  const createGradient = (th=0, mh=0, bh=0,
                          ts=0, ms=0, bs=0, 
                          tl=0, ml=0, bl=0) => {
    let bgColorCopy
    weather?.city.sunrise > 0 ?
      bgColorCopy = {top: {hue: 0, sat: 100, lig: 50 }, middle: {hue: 0,  sat: 44, lig: 25 }, bottom: {hue: 0,  sat: 0, lig: 0 }} :
      bgColorCopy = {top: {hue: 0,  sat: 50, lig: 30 }, middle: {hue: 0,  sat: 25, lig: 10 }, bottom: {hue: 0,  sat: 0, lig: 0 }}

    bgColorCopy = {
      top:    {...bgColorCopy.top   , hue: bgColorCopy.top.hue + th   , sat: bgColorCopy.top.sat + ts   , lig: bgColorCopy.top.lig + tl }, 
      middle: {...bgColorCopy.middle, hue: bgColorCopy.middle.hue + mh, sat: bgColorCopy.middle.sat + ms, lig: bgColorCopy.middle.lig + ml }, 
      bottom: {...bgColorCopy.bottom, hue: bgColorCopy.bottom.hue + bh, sat: bgColorCopy.bottom.sat + bs, lig: bgColorCopy.bottom.lig + bl }}
    return bgColorCopy
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
      resjson.cod === "200" ? setWeather(resjson) : toast(resjson.message)
      setSearchInput(null)
    }
    getWeather()
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
        setBgColor(createGradient(255,245,222))
        break;
      case "Drizzle":
      case "Clouds":
        setBgColor(createGradient(200,200,200,0,-22,0,50))
        break;
      case "Rain":
        setBgColor(createGradient(220,215,200,-10,10))
        break;
      case "Snow":
        setBgColor(createGradient(200,200,200,0,-50,0,50,50))
        break;
      case "Mist":
      case "Smoke":
      case "Haze":
      case "Fog":
      case "Ash":
      case "Squall":
      case "Tornado":
        setBgColor(createGradient(200,200,200,-100,-50,0,0,5))
        break;
      case "Dust":
      case "Sand":
        setBgColor(createGradient(42,42,42,-70,-20))
        break;
      case "Clear":
        setBgColor(createGradient(200,200,200,-20,-20,0,36,25))
        break;
      default:
        break;
    }
  //eslint-disable-next-line react-hooks/exhaustive-deps
  },[weather])

  useEffect(()=>{
    setStyle({background: `linear-gradient(0deg, 
      hsl(${bgColor?.bottom.hue},${bgColor?.bottom.sat}%,${bgColor?.bottom.lig}%) 0%, 
      hsl(${bgColor?.middle.hue},${bgColor?.middle.sat}%,${bgColor?.middle.lig}%) 35%, 
      hsl(${bgColor?.top.hue},${bgColor?.top.sat}%,${bgColor?.top.lig}%) 100%)`})
  },[bgColor])

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
      </div>
    </div>
  );
}
