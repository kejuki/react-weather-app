import { useEffect, useState } from "react";

export default function App() {
  const [location, setLocation] = useState(null)
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
    if(!location || weather) return
    const getWeather = async () => {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${location.coords.latitude}&lon=${location.coords.longitude}&cnt=1&appid=${process.env.REACT_APP_WEATHER_APK}`)
      const resjson = await res.json()
      setWeather(resjson)
      const weatherCache = {...resjson, expires: Date.now() + 3600 * 1000}
      localStorage.setItem("weatherCache", JSON.stringify(weatherCache))
    }
    getWeather()
  },[location, weather])

  useEffect(()=>{
    let bgColorCopy
    weather?.city.sunrise > 0 ?
      bgColorCopy = {top: { sat: 100, lig: 50 }, middle: { sat: 44, lig: 25 }, bottom: { sat: 0, lig: 0 }} :
      bgColorCopy = {top: { sat: 50, lig: 30 }, middle: { sat: 25, lig: 10 }, bottom: { sat: 0, lig: 0 }}

    console.log(weather?.list[0].weather[0].main)

    switch (weather?.list[0].weather[0].main) {
      case "Thunderstorm":
        bgColorCopy = {
          top: {...bgColorCopy.top, hue: 255 }, 
          middle: {...bgColorCopy.middle, hue: 245 }, 
          bottom: {...bgColorCopy.bottom, hue: 222 }}
        break;
      case "Drizzle":
      case "Clouds":
        bgColorCopy = {
          top: {...bgColorCopy.top, hue: 200, lig: bgColorCopy.top.lig + 50 }, 
          middle: {...bgColorCopy.middle, hue: 200, sat: bgColorCopy.middle.sat - 22 }, 
          bottom: {...bgColorCopy.bottom, hue: 200 }}
        break;
      case "Rain":
        bgColorCopy = {
          top: {...bgColorCopy.top, hue: 220, sat: bgColorCopy.middle.sat - 10 }, 
          middle: {...bgColorCopy.middle, hue: 215, sat: bgColorCopy.middle.sat + 10 }, 
          bottom: {...bgColorCopy.bottom, hue: 200 }}
        break;
      case "Snow":
        bgColorCopy = {
          top: {...bgColorCopy.top, hue: 200, lig: bgColorCopy.top.lig + 50 }, 
          middle: {...bgColorCopy.middle, hue: 200, sat: bgColorCopy.middle.sat -50, lig: bgColorCopy.middle.lig + 50 }, 
          bottom: {...bgColorCopy.bottom, hue: 200 }}
        break;
      case "Mist":
      case "Smoke":
      case "Haze":
      case "Fog":
      case "Ash":
      case "Squall":
      case "Tornado":
        bgColorCopy = {
          top: {...bgColorCopy.top, hue: 200,sat: bgColorCopy.top.sat -100 }, 
          middle: {...bgColorCopy.middle, hue: 200, sat: bgColorCopy.middle.sat -50, lig: bgColorCopy.middle.lig + 5 }, 
          bottom: {...bgColorCopy.bottom, hue: 200 }}
        break;
      case "Dust":
      case "Sand":
        bgColorCopy = {
          top: {...bgColorCopy.top, hue: 42, sat: bgColorCopy.top.sat -70 }, 
          middle: {...bgColorCopy.middle, hue: 42, sat: bgColorCopy.middle.sat -20 }, 
          bottom: {...bgColorCopy.bottom, hue: 42 }}
        break;
      case "Clear":
        bgColorCopy = {
          top: {...bgColorCopy.top, hue: 200, sat: bgColorCopy.top.sat -20, lig: bgColorCopy.top.lig + 36}, 
          middle: {...bgColorCopy.middle, hue: 200, sat: bgColorCopy.middle.sat -20, lig: bgColorCopy.middle.lig + 25 }, 
          bottom: {...bgColorCopy.bottom, hue: 200 }}
        break;
      default:
        break;
    }
    setBgColor(bgColorCopy)
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
        <div className="row">
          <img src={`https://openweathermap.org/img/wn/${weather?.list[0].weather[0].icon}@4x.png`} alt="weather icon"></img>
          <div className="col">
            <h1>{`${Math.round(weather?.list[0].main.temp-273.15)}°C`}</h1>
            <h2>{`Feels like ${Math.round(weather?.list[0].main.feels_like-273.15)}°C`}</h2>
            <h2>{weather?.list[0].weather[0].description}</h2>
            <h2>{`humidity: ${weather?.list[0].main.humidity}%`}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
