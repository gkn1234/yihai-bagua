/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-27 18:59:22
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-28 18:24:09
 * @Description: 通用方法测试
 */
import { solarStr } from '@yhbagua/calendar'

describe('测试公历转字符串', () => {
  test('默认格式', () => {
    expect(solarStr([1, 8, 27, 23, 6, 3])).toEqual('1-08-27 23:06:03')
  })
  test('复杂格式', () => {
    expect(solarStr([2021, 8, 27, 9, 6, 13], 'yyYyY年MMmmmMmMMm月Dd日 HhH时mM分Ss秒')).toEqual('02021年0000000008月27日 009时06分13秒')
  })
  test('公元前年份处理', () => {
    expect(solarStr([-1, 8, 27, 23, 6, 3], 'YYY-M-ddd h:m:ss')).toEqual('-001-8-027 23:6:03')
  })
  test('对于无法匹配的格式串，采取 y-MM-dd hh:mm:ss 的默认模式串', () => {
    expect(solarStr([2000, 12, 24, 17, 15, 8], 'TT/pp/dd hh:uu:ss')).toEqual('2000-12-24 17:15:08')
  })
  test('不严格遵守ymdhms的顺序无法识别模式串，按照默认格式匹配', () => {
    expect(solarStr([2000, 12, 24, 17, 15, 8], 'dd-mm-y ss:mm:hh')).toEqual('2000-12-24 17:15:08')
  })
  test('部分输出的模式串', () => {
    // 正常的部分匹配
    expect(solarStr([2000, 12, 24, 17, 15, 8], 'y-mm-dd hh时mm分')).toEqual('2000-12-24 17时15分')
    expect(solarStr([2000, 12, 24, 17, 15, 8], 'y-mm-dd Hh时')).toEqual('2000-12-24 17时')
    expect(solarStr([2000, 12, 24, 17, 15, 8], 'y-mm-dd')).toEqual('2000-12-24')
    expect(solarStr([2000, 12, 24, 17, 15, 8], 'YyYY')).toEqual('2000')
    expect(solarStr([2000, 12, 24, 17, 15, 8], 'y-m')).toEqual('2000-12')

    // 极端的部分匹配
    expect(solarStr([2000, 12, 24, 17, 15, 8], 'Y/pp/dd hh:uu:ss')).toEqual('2000/pp/dd hh:uu:ss')
  })
})