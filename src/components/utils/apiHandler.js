import { ref } from 'vue'
import axios from 'axios'

// 지역명으로 좌표 검색 API
const SEARCH_URL = 'https://api.openweathermap.org/geo/1.0/direct'
// 좌표로 지역명 검색 API
const REVERSE_SEARCH_URL = 'https://api.openweathermap.org/geo/1.0/reverse'
// 좌표로 날씨 검색 API
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const STORAGE_KEY = 'weather-city-list'

const DEFAULTWEATHERLIST = [
  {
    id: 1835848,
    name: '서울',
    lat: 37.5656,
    lon: 126.978,
    temp: 28,
    weatherMain: 'Clear',
    status: '맑음',
    feelsLike: 29,
    humidity: 60,
    tempMin: 27,
    tempMax: 29,
    icon: '01d',
    updatedAt: 1785802845000,
    isFavorite: false,
  },
  {
    id: 5128581,
    name: '뉴욕',
    lat: 40.7127281,
    lon: -74.0060152,
    temp: 24,
    weatherMain: 'Clouds',
    status: '튼구름',
    feelsLike: 24,
    humidity: 75,
    tempMin: 21,
    tempMax: 25,
    icon: '04d',
    updatedAt: 1785930978000,
    isFavorite: false,
  },
]

const loadWeatherList = () => {
  try {
    const savedList = window.localStorage.getItem(STORAGE_KEY)

    // 저장 데이터가 없으면 현재 위치 초기화를 위해 빈 목록으로 시작합니다.
    if (!savedList) {
      return []
    }

    const parsedList = JSON.parse(savedList)

    if (!Array.isArray(parsedList)) {
      return []
    }

    // 즐겨찾기
    return parsedList.map((city) => ({
      ...city,
      isFavorite: city.isFavorite ?? false,
    }))
  } catch (error) {
    console.error('저장된 날씨 목록을 불러오지 못했습니다.', error)
    return []
  }
}

const weatherList = ref(loadWeatherList())

// 여러 컴포넌트가 동시에 useAPI()를 호출해도 위치 요청은 한 번만 실행합니다.
let initialLoadPromise = null

const saveWeatherList = () => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(weatherList.value))
}

const loadDefaultWeatherList = () => {
  // 드래그 정렬로 원본 상수가 변하지 않도록 객체를 복사합니다.
  weatherList.value = DEFAULTWEATHERLIST.map((city) => ({ ...city }))
  saveWeatherList()
  return weatherList.value
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

export const useAPI = () => {
  const isLoading = ref(false)
  const errorMsg = ref('')

  const checkApiKey = () => {
    if (!API_KEY) {
      throw new Error('VITE_OPENWEATHER_API_KEY가 설정되지 않았습니다.')
    }
  }

  // 브라우저의 콜백 기반 위치 조회를 await 가능한 Promise로 변환합니다.
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('현재 위치 기능을 지원하지 않는 브라우저입니다.'))
        return
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      })
    })
  }

  // 도시 이름으로 좌표 조회
  const searchLocation = async (cityName) => {
    checkApiKey()

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

  // 좌표로 지역명을 역지오코딩합니다.
  const reverseGeocode = async (lat, lon) => {
    checkApiKey()

    const response = await axios.get(REVERSE_SEARCH_URL, {
      params: {
        lat,
        lon,
        limit: 1,
        appid: API_KEY,
      },
    })

    const location = response.data[0]

    return {
      name: location?.local_names?.ko ?? location?.name ?? '현재 위치',
      lat: location?.lat ?? lat,
      lon: location?.lon ?? lon,
    }
  }

  // 좌표로 날씨 조회
  const fetchWeather = async (lat, lon) => {
    checkApiKey()

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

  // 저장 목록이 없는 첫 방문에 현재 위치 카드 한 장을 생성합니다.
  const initializeWeatherList = async () => {
    // 이미 저장된 목록이 있다면 위치 권한을 다시 요청하지 않습니다.
    if (window.localStorage.getItem(STORAGE_KEY) !== null) {
      return weatherList.value
    }

    // 동시에 여러 번 호출되어도 같은 초기화 작업을 공유합니다.
    if (initialLoadPromise) {
      return initialLoadPromise
    }

    isLoading.value = true
    errorMsg.value = ''

    initialLoadPromise = (async () => {
      try {
        const position = await getCurrentPosition()
        const { latitude: lat, longitude: lon } = position.coords

        // 같은 좌표를 이용하는 두 API 요청은 동시에 실행합니다.
        const [location, weather] = await Promise.all([
          reverseGeocode(lat, lon),
          fetchWeather(lat, lon),
        ])

        const currentCity = {
          ...weather,
          name: location.name,
          isFavorite: false,
        }

        weatherList.value = [currentCity]
        saveWeatherList()

        return weatherList.value
      } catch (error) {
        console.error('현재 위치 날씨 초기화 실패:', error)

        // 사용자가 위치 제공을 거부했을 때는 오류 화면 대신 기본 목록을 표시합니다.
        if (error?.code === 1) {
          errorMsg.value = ''
        } else {
          errorMsg.value = '현재 위치를 불러오지 못해 기본 도시 목록을 표시합니다.'
        }

        return loadDefaultWeatherList()
      } finally {
        isLoading.value = false
        initialLoadPromise = null
      }
    })()

    return initialLoadPromise
  }

  // 도시 최초 추가
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

      // 새 도시 추가: OpenWeather ID의 숫자 타입을 그대로 유지합니다.
      const newCity = {
        ...location,
        ...weather,
        isFavorite: false,
      }

      weatherList.value.push(newCity)
      saveWeatherList()

      return newCity
    } catch (error) {
      console.error('도시 추가 실패:', error)
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
      console.error('날씨 갱신 실패:', error)
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
      console.error('전체 날씨 갱신 실패:', error)
      errorMsg.value = createErrorMessage(error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // WeatherCard를 드래그하여 순서 교체
  const reorderCard = (oldIndex, newIndex) => {
    const lastIndex = weatherList.value.length - 1

    if (
      oldIndex === newIndex ||
      oldIndex < 0 ||
      newIndex < 0 ||
      oldIndex > lastIndex ||
      newIndex > lastIndex
    ) {
      return
    }

    const [movedCity] = weatherList.value.splice(oldIndex, 1)
    weatherList.value.splice(newIndex, 0, movedCity)
    saveWeatherList()
  }

  // 도시 삭제
  const removeCity = (cityId) => {
    const cityIndex = weatherList.value.findIndex((city) => city.id === cityId)

    if (cityIndex === -1) {
      return null
    }

    const [removedCity] = weatherList.value.splice(cityIndex, 1)

    saveWeatherList()

    return removedCity
  }

  // 즐겨찾기 상태 변경
  const toggleFavorite = (cityId) => {
    const cityIndex = weatherList.value.findIndex((city) => city.id === cityId)

    if (cityIndex === -1) {
      return null
    }

    const currentCity = weatherList.value[cityIndex]

    const updatedCity = {
      ...currentCity,
      isFavorite: !currentCity.isFavorite,
    }

    weatherList.value[cityIndex] = updatedCity

    saveWeatherList()

    return updatedCity
  }

  return {
    weatherList,
    isLoading,
    errorMsg,
    initializeWeatherList,
    searchLocation,
    reverseGeocode,
    fetchWeather,
    addCity,
    refreshCity,
    refreshAllCity,
    reorderCard,
    removeCity,
    toggleFavorite,
  }
}
