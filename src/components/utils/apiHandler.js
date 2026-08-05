import { ref } from 'vue'
import axios from 'axios'

// 지역명으로 좌표 검색 API
const SEARCH_URL = 'https://api.openweathermap.org/geo/1.0/direct'
// 좌표로 날씨 검색 API
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'

const API_KEY = '1d7cad049b2a1a8885d70dd728f429e3'

const STORAGE_KEY = 'weather-city-list'
localStorage.removeItem('weather-city-list')

const TESTWEATHERLIST = [
  {
    id: 1835848,
    name: '서울',
    lat: 37.5656,
    lon: 126.978,
    temp: 28,
    weatherMain: 'Sunny',
    status: '맑음',
    feelsLike: 29,
    humidity: 60,
    tempMin: 27,
    tempMax: 29,
    icon: '01d',
    updatedAt: 1785802845000,
  },
  {
    id: 6573030,
    name: '수원시',
    lat: 37.2636,
    lon: 127.0286,
    temp: 24,
    weatherMain: 'Rain',
    status: '비',
    feelsLike: 26,
    humidity: 80,
    tempMin: 22,
    tempMax: 26,
    icon: '10d',
    updatedAt: 1775892845000,
  },
  {
    id: 1838519,
    name: '부산광역시',
    lat: 35.1796,
    lon: 129.0756,
    temp: 26,
    weatherMain: 'Clouds',
    status: '구름',
    feelsLike: 25,
    humidity: 70,
    tempMin: 23,
    tempMax: 25,
    icon: '02d',
    updatedAt: 1685892845000,
  },
]

const loadWeatherList = () => {
  try {
    const savedList = window.localStorage.getItem(STORAGE_KEY)
    if (!savedList) {
      //return TESTWEATHERLIST
      navigator.geolocation.getCurrentPosition(function(pos) {
        const weather = useAPI.fetchWeather(pos.coords.latitude, pos.coords.longitude)
        const newCity = {
          id: `${weather.id}`,
          name: weather.
        }
      })
    }

    const parsedList = JSON.parse(savedList)
    return Array.isArray(parsedList) ? parsedList : TESTWEATHERLIST
  } catch (error) {
    console.error('저장된 날씨 목록을 불러오지 못했습니다.', error)
    return TESTWEATHERLIST
  }
}

const weatherList = ref(loadWeatherList())

const saveWeatherList = () => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(weatherList.value))
}

const createErrorMessage = (error) => {
  const status = error.response?.status

  if (status === 401) {
    return 'API Key에 문제가 있습니다.'
  }

  if (status === 404) {
    return '요청한 도시의 날씨 정보를 찾지 못했습니다.'
  }

  if (status === 429) {
    return 'API 호출 가능 횟수를 초과했습니다.'
  }

  return error.message || '날씨 정보를 가져오지 못했습니다.'
}

function unixTimeStamp(t) {
  const date = new Date(t * 1000)
  const year = date.getFullYear()
  const month = '0' + (date.getMonth() + 1)
  const day = '0' + date.getDate()
  const hour = '0' + date.getHours()
  const minute = '0' + date.getMinutes()

  return (
    year +
    '년' +
    month.substring(-2) +
    '월' +
    day.substring(-2) +
    '일' +
    ' ' +
    hour.substring(-2) +
    ':' +
    minute.substring(-2)
  )
}

export const useAPI = () => {
  const isLoading = ref(false)
  const errorMsg = ref('')
  // 도시 좌표 조회
  const searchLocation = async (cityName) => {
    const trimmed = cityName.trim()

    if (!trimmed) {
      throw new Error('도시 이름을 입력해주세요.')
    }

    const response = await axios.get(SEARCH_URL, {
      params: {
        q: trimmed,
        limit: 1,
        appid: API_KEY,
      },
    })

    const location = response.data[0]

    if (!location) {
      throw new Error('검색 결과가 없습니다.')
    }

    return {
      name: location.local_names?.ko ?? location.name,
      lat: location.lat,
      lon: location.lon,
    }
  }
  // 날씨 조회
  const fetchWeather = async (lat, lon) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error('올바른 위도와 경도를 입력해주세요.')
    }

    const response = await axios.get(WEATHER_URL, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
        lang: 'kr',
      },
    })

    const data = response.data

    return {
      id: data.id,
      lat: data.coord?.lat ?? lat,
      lon: data.coord?.lon ?? lon,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      weatherMain: data.weather[0]?.main ?? '',
      status: data.weather[0]?.description ?? '',
      icon: data.weather[0]?.icon ?? '',
      updatedAt: data.dt ? data.dt * 1000 : Date.now(),
    }
  }

  // 최초 추가
  const addCity = async (cityName) => {
    isLoading.value = true
    errorMsg.value = ''

    try {
      const location = await searchLocation(cityName)
      const weather = await fetchWeather(location.lat, location.lon)
      // 도시 이름으로 중복 확인
      const sameCityIndex = weatherList.value.findIndex((item) => item.name === location.name)
      // 기존에 이미 도시가 등록되어 있으면
      if (sameCityIndex !== -1) {
        const existingCity = weatherList.value[sameCityIndex]
        const updatedCity = {
          ...existingCity,
          ...location,
          ...weather,
        }

        weatherList.value[sameCityIndex] = updatedCity
        saveWeatherList()
        return updatedCity
      }
      // 새로 추가일 경우
      const newCity = {
        id: `${weather.id}`,
        ...location,
        ...weather,
      }

      weatherList.value.push(newCity)
      saveWeatherList()

      return newCity
    } catch (error) {
      console.error('도시 추가 실패: ', error)
      errorMsg.value = createErrorMessage(error)
      return null
    } finally {
      isLoading.value = false
    }
  }
  // 기존 도시 갱신
  const refreshCity = async (cityId) => {
    isLoading.value = true
    errorMsg.value = ''

    try {
      const cityIndex = weatherList.value.findIndex((item) => item.id === cityId)

      if (cityIndex === -1) {
        throw new Error('갱신할 도시를 찾지 못했습니다.')
      }

      const currentCity = weatherList.value[cityIndex]
      const weather = await fetchWeather(currentCity.lat, currentCity.lon)

      const updatedCity = {
        ...currentCity,
        ...weather,
      }

      weatherList.value[cityIndex] = updatedCity
      saveWeatherList()

      return updatedCity
    } catch (error) {
      console.error('날씨 갱신 실패: ', error)
      errorMsg.value = createErrorMessage(error)
      return null
    } finally {
      isLoading.value = false
    }
  }
  // 전체 도시 날씨 갱신
  const refreshAllCity = async () => {
    isLoading.value = true
    errorMsg.value = ''
    // 하나라도 갱신 실패시 취소
    try {
      const updatedList = await Promise.all(
        weatherList.value.map(async (city) => {
          const weather = await fetchWeather(city.lat, city.lon)
          return {
            ...city,
            ...weather,
          }
        }),
      )

      weatherList.value = updatedList
      saveWeatherList()
      return updatedList
    } catch (error) {
      console.error('전체 날씨 갱신 실패: ', error)
      errorMsg.value = createErrorMessage(error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    weatherList,
    isLoading,
    errorMsg,
    searchLocation,
    fetchWeather,
    addCity,
    refreshCity,
    refreshAllCity,
  }
}
