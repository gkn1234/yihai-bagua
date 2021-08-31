/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-27 15:47:14
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-27 15:47:14
 * @Description: 
 */
import {
  date2Rulue, 
  rulue2Date, 
  J2000,
} from '@yhbagua/astro'

describe('测试儒略计算方法', () => {
  test('日期转儒略', () => {
    expect(date2Rulue([2000, 1, 1, 12, 0, 0])).toBeCloseTo(2451545.0 - J2000)
    expect(date2Rulue([1987, 1, 27, 0, 0, 0])).toBeCloseTo(2446822.5 - J2000)
    expect(date2Rulue([1987, 6, 19, 12, 0, 0])).toBeCloseTo(2446966.0 - J2000)
    expect(date2Rulue([1988, 1, 27, 0, 0, 0])).toBeCloseTo(2447187.5 - J2000)
    expect(date2Rulue([1988, 6, 19, 12, 0, 0])).toBeCloseTo(2447332.0 - J2000)
    expect(date2Rulue([1900, 1, 1, 0, 0, 0])).toBeCloseTo(2415020.5 - J2000)
    expect(date2Rulue([1600, 1, 1, 0, 0, 0])).toBeCloseTo(2305447.5 - J2000)
    expect(date2Rulue([1600, 12, 31, 0, 0, 0])).toBeCloseTo(2305812.5 - J2000)
    expect(date2Rulue([837, 4, 10, 7, 12, 0])).toBeCloseTo(2026871.8 - J2000)
    expect(date2Rulue([-1000, 7, 12, 12, 0, 0])).toBeCloseTo(1356001.0 - J2000)
    expect(date2Rulue([-1000, 2, 29, 0, 0, 0])).toBeCloseTo(1355866.5 - J2000)
    expect(date2Rulue([-1001, 8, 17, 21, 36, 0])).toBeCloseTo(1355671.4 - J2000)
    expect(date2Rulue([-4712, 1, 1, 12, 0, 0])).toBeCloseTo(0 - J2000)
  })

  test('儒略转日期', () => {
    expect(rulue2Date(2451545.0 - J2000)).toEqual([2000, 1, 1, 12, 0, 0])
    expect(rulue2Date(2446822.5 - J2000)).toEqual([1987, 1, 27, 0, 0, 0])
    expect(rulue2Date(2446966.0 - J2000)).toEqual([1987, 6, 19, 12, 0, 0])
    expect(rulue2Date(2447187.5 - J2000)).toEqual([1988, 1, 27, 0, 0, 0])
    expect(rulue2Date(2447332.0 - J2000)).toEqual([1988, 6, 19, 12, 0, 0])
    expect(rulue2Date(2415020.5 - J2000)).toEqual([1900, 1, 1, 0, 0, 0])
    expect(rulue2Date(2305447.5 - J2000)).toEqual([1600, 1, 1, 0, 0, 0])
    expect(rulue2Date(2305812.5 - J2000)).toEqual([1600, 12, 31, 0, 0, 0])
    expect(rulue2Date(2026871.8 - J2000)).toEqual([837, 4, 10, 7, 12, 0])
    expect(rulue2Date(1356001.0 - J2000)).toEqual([-1000, 7, 12, 12, 0, 0])
    expect(rulue2Date(1355866.5 - J2000)).toEqual([-1000, 2, 29, 0, 0, 0])
    expect(rulue2Date(1355671.4 - J2000)).toEqual([-1001, 8, 17, 21, 36, 0])
    expect(rulue2Date(0 - J2000)).toEqual([-4712, 1, 1, 12, 0, 0])
  })
})