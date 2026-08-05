import axios from 'axios'

const API_URL = import.meta.env.PROD
  ? 'https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa'
  : '/kma-api/1360000/MidFcstInfoService/getMidTa'

const SERVICE_KEY = import.meta.env.VITE_KMA_SERVICE_KEY

const pad2 = (value) => String(value).padStart(2, '0')

const formatTmFc = (date, hour) => {
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
    pad2(hour),
    '00',
  ].join('')
}

const previousDay = (date) => {
  const copiedDate = new Date(date)
  copiedDate.setDate(copiedDate.getDate() - 1)
  return copiedDate
}

const getTmFcCandidates = () => {
  const now = new Date()
  const hour = now.getHours()
  const yesterday = previousDay(now)

  if (hour >= 18) {
    return [formatTmFc(now, 18), formatTmFc(now, 6)]
  }

  if (hour >= 6) {
    return [formatTmFc(now, 6), formatTmFc(yesterday, 18)]
  }

  return [formatTmFc(yesterday, 18), formatTmFc(yesterday, 6)]
}

const getResponseItem = (data) => {
  if (!data || typeof data === 'string') {
    throw new Error('JSON 형식의 응답을 받지 못했습니다.')
  }

  const response = data.response
  const resultCode = String(response?.header?.resultCode ?? '')

  if (resultCode !== '00' && resultCode !== '0') {
    const resultMessage = response?.header?.resultMsg || '기상청 API 요청에 실패했습니다.'

    throw new Error(resultMessage)
  }

  const rawItem = response?.body?.items?.item

  if (Array.isArray(rawItem)) {
    return rawItem[0]
  }

  return rawItem
}

export const fetchFiveDayTemperature = async (regId) => {
  if (!SERVICE_KEY) {
    throw new Error('VITE_KMA_SERVICE_KEY가 설정되지 않았습니다.')
  }

  let lastError = null

  for (const tmFc of getTmFcCandidates()) {
    try {
      const response = await axios.get(API_URL, {
        params: {
          serviceKey: SERVICE_KEY,
          numOfRows: 10,
          pageNo: 1,
          dataType: 'JSON',
          regId,
          tmFc,
        },
      })

      const item = getResponseItem(response.data)

      if (item?.taMin5 == null || item?.taMax5 == null) {
        throw new Error('5일 뒤 기온 데이터가 없습니다.')
      }

      return {
        regId,
        tmFc,
        minTemperature: Number(item.taMin5),
        maxTemperature: Number(item.taMax5),
      }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('중기기온 정보를 불러오지 못했습니다.')
}
