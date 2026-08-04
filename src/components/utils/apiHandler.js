import { ref } from 'vue'
import axios from 'axios'

// 지역명으로 좌표 검색 API
const SEARCH_URL = 'https://api.openweathermap.org/geo/1.0/direct'
// 좌표로 날씨 검색 API
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'

const API_KEY = '1d7cad049b2a1a8885d70dd728f429e3'

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