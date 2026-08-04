const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ',
  'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ',
  'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
]

const START_CODE = '가'.charCodeAt(0)
const CHO_PERIOD = '까'.charCodeAt(0) - '가'.charCodeAt(0)
const JUNG_PERIOD = '개'.charCodeAt(0) - '가'.charCodeAt(0)
// 초성 중성 종성 인덱스를 이용해 완성형 문자 결합
const combine = (cho, jung, jong) => {
  return String.fromCharCode(
    START_CODE
      + cho * CHO_PERIOD
      + jung * JUNG_PERIOD
      + jong,
  )
}
// 정규식 인식 방지
const escapeRegex = (character) => {
  return character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
// 입력된 값을 초성 검색이 가능한 정규식으로 변환
const makeRegexByCho = (search = '') => {
  const pattern = Array.from(search.trim())
    .map((character) => {
      const choIndex = CHOSUNG.indexOf(character)

      if (choIndex === -1) {
        return escapeRegex(character)
      }

      const start = combine(choIndex, 0, 0)
      const end = combine(choIndex + 1, 0, -1)

      return `[${start}-${end}]`
    })
    .join('')

  // ^를 사용하여 도시 이름의 첫 글자부터 비교
  return new RegExp(`^(${pattern})`, 'i')
}

export const searchByChosung = (search, targetWord) => {
  if (search.trim() === '') {
    return true
  }

  return makeRegexByCho(search).test(targetWord)
}