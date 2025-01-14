import React, { useEffect, useState } from "react"
import { getBingBackgroung } from "../../../services/getBingBackground"
import { getLocationByCoordinates, getLocationByLocalName } from "../../../services/getLocation"
import { getCurrentWeather, getForecastForNextDays } from "../../../services/getWeather"
import Banner from "../../atoms/Banner"
import Input from "../../atoms/Input"
import loadingGif from  '../../../assets/icons/loading.gif'
import { Container, Wrapper } from "./styles"
import { CurrentWeatherProps, ForecastWeatherProps, LocationProps } from "./types"
import { celsiusToFahrenheit, colorByTemperature, degToCardinal, firstLetterUppercase, validateInput } from "../../../utils/functions"
import { INITAL_STATE } from "../../../utils/consts"

const Weather: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [isCelsius, setIsCelsius] = useState(true)
  const [locationName, setLocationName] = useState<LocationProps>(INITAL_STATE.LOCATION_STATE)
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherProps>(INITAL_STATE.CURRENT_WEATHER)
  const [forecast, setForecast] = useState<ForecastWeatherProps>(INITAL_STATE.FORECAST)
  const [bingBackground, setBingBackground] = useState(INITAL_STATE.BING)
  const [localName, setLocalName] = useState('')

  const callLocationByCoordinates = async (latitude: number, longitude: number) =>  {
    const response = await getLocationByCoordinates(latitude, longitude)
    setLocationName(response)
  }

  const callCurrentWeather = async (latitude: number, longitude: number) =>  {
    const response = await getCurrentWeather(latitude, longitude)
    setCurrentWeather(response)
  }

  const callForecastNextDays = async (latitude: number, longitude: number) =>  {
    const response = await getForecastForNextDays(latitude, longitude)
    setForecast(response)
  }

  const getBackground = async () => {
    const response = await getBingBackgroung()
    setBingBackground(`https://www.bing.com/${response}`)
  }

  const callLocationByName = async () =>  {
    if (localName !== "") {
     const response = await getLocationByLocalName(localName)
     setLocationName(response)
    }
  }

  useEffect(() => {
    if (locationName.results[0]?.components) {
      setLocalName(`${locationName.results[0]?.components?.city}, ${locationName.results[0]?.components?.state || locationName.results[0]?.components?.country}`)
    }
    if (locationName.results[0]?.geometry) {
      callCurrentWeather(locationName.results[0].geometry.lat, locationName.results[0].geometry.lng)
      callForecastNextDays(locationName.results[0].geometry.lat, locationName.results[0].geometry.lng)
     }
  }, [locationName])

  useEffect( () => {
    getBackground()
    navigator.geolocation.getCurrentPosition( position => {
      callLocationByCoordinates(position.coords.latitude, position.coords.longitude)
      callCurrentWeather(position.coords.latitude, position.coords.longitude)
      callForecastNextDays(position.coords.latitude, position.coords.longitude)
    })
    setLoading(false)
  }, [] )

  return (
  <Container backgroundUrl={bingBackground}>
    { loading ?
      <img src={loadingGif}/>
    :
      <Wrapper>
        <Input
          value={localName}
          onChange={(value) => {
            setLocalName(value)
          }}
          onBlur={callLocationByName}
        />
        <Banner
          height="50vh"
          opacity="0.7"
          imgSrc={`http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@4x.png`}
          dayTitle="HOJE"
          temperature={isCelsius ? `${currentWeather.main.temp} °C` : `${celsiusToFahrenheit(currentWeather.main.temp)} °F`}
          temperatureDescription={firstLetterUppercase(currentWeather.weather[0].description)}
          additionalInfo={{
            vento: `${degToCardinal(currentWeather.wind.deg)} ${currentWeather.wind.speed}km/h`,
            umidade: `${currentWeather.main.humidity}%`,
            pressao: `${currentWeather.main.pressure}hPA`
          }}
          backgroundColor={colorByTemperature(currentWeather.main.temp)}
          temperatureConverter={() => setIsCelsius(!isCelsius)}
        />
        <Banner
          height="15vh"
          opacity="0.8"
          dayTitle="AMANHÃ"
          temperature={isCelsius ? `${forecast.list[4]?.main?.temp} °C` : `${celsiusToFahrenheit(forecast.list[4]?.main?.temp)} °F`}
          backgroundColor={colorByTemperature(forecast.list[4]?.main?.temp)}
          temperatureConverter={() => setIsCelsius(!isCelsius)}
        />
        <Banner
          height="15vh"
          opacity="1"
          dayTitle="DEPOIS DE AMANHÃ"
          temperature={isCelsius ? `${forecast.list[12]?.main?.temp} °C` : `${celsiusToFahrenheit(forecast.list[12]?.main?.temp)} °F`}
          backgroundColor={colorByTemperature(forecast.list[12]?.main?.temp)}
          temperatureConverter={() => setIsCelsius(!isCelsius)}/>
       </Wrapper>
    }
  </Container>
  )
}

export default Weather
