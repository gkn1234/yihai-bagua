/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-06 23:48:14
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-28 18:28:51
 * @Description: 公历日期数据结构定义
 */
import { SolarArr } from './common/types'
import { J2000 } from './common/consts'

/**
 * 公历日转儒略日，得到【常规儒略日】(相对于2000/1/1的儒略日)
 * @param solar 公历数据
 */
export function date2Rulue (solar: SolarArr): number {
  let [y, m, d, h, mi, s] = solar
  // 先把小时和分钟划入日的小数部分
  d = d + ((s / 60 + mi) / 60 + h) / 24

  let isG = false
  // 是否为格里高利历日1582*372+10*31+15
  if (y * 372 + m * 31 + Math.floor(d) >= 588829) {
    isG = true
  }

  if (m <= 2) {
    m += 12
    y--
  }

  // 计算格里高利历下的闰年天数
  let n = 0
  if (isG) {
    n = Math.floor(y / 100)
    n = 2 - n + Math.floor(n / 4)
  }

  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + n - 1524.5 - J2000
}

/**
 * 儒略日转公历日
 * @param rulue 【常规儒略日】(相对于2000/1/1的儒略日)
 */
export function rulue2Date (rulue: number = J2000): SolarArr {
  rulue += J2000
  // 儒略日的整数与小数部分
  let rulueInt = Math.round(rulue)
  let rulueFloat = rulue + 0.5 - rulueInt

  if (rulueInt > 2299161) {
    const c = Math.floor((rulueInt - 1867216.25) / 36524.25)
    rulueInt = rulueInt + 1 + c - Math.floor(c / 4)
  }

  // 得到年数
  rulueInt = rulueInt + 1524
  let y = Math.floor((rulueInt - 122.1) / 365.25)
  // 得到月数
  rulueInt = rulueInt - Math.floor(365.25 * y)
  let m = Math.floor(rulueInt / 30.601)
  // 得到日数
  rulueInt = rulueInt - Math.floor(30.601 * m)
  let d = rulueInt

  if (m > 13) {
    m = m - 13
    y = y - 4715
  }
  else {
    m = m - 1
    y = y - 4716
  }

  // 日的小数转化为时分秒
  rulueFloat = rulueFloat * 24
  let h = Math.floor(rulueFloat)
  rulueFloat = rulueFloat - h

  rulueFloat = rulueFloat * 60
  let mi = Math.floor(rulueFloat)
  rulueFloat = rulueFloat - mi

  let s = Math.round(rulueFloat * 60)

  if (s >= 60) {
    s = s - 60
    mi++
  }
  if (mi >= 60) {
    mi = mi - 60
    h++
  }

  return [y, m, d, h, mi, s]
}