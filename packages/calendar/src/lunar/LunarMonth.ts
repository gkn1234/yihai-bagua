/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-27 19:20:02
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-28 19:01:55
 * @Description: 农历月历
 */
import { date2Rulue, J2000 } from '@yhbagua/astro'
import { resolveMonth } from '../common/utils'
import { LunarDay } from './LunarDay'

// 缓存最大容量
const MAX_CACHE_SIZE = 240

// 寿星农历月历
export class LunarMonth {
  // 缓存计算过的年份
  static _cache: Map<string, LunarMonth> = new Map()
  
  // 从缓存中寻找
  static _getFromCache (year: number, month: number): LunarMonth | undefined {
    const key = `${year}-${month}`
    return LunarMonth._cache.get(key)
  }
  
  // 存入缓存
  static _setToCache (lunarMonth: LunarMonth) {
    const len = LunarMonth._cache.size
    if (len === MAX_CACHE_SIZE) {
      // 缓存满后，每次清理前一半的内容
      let iterator = LunarMonth._cache.keys()
      for (let i = 0; i < Math.floor(MAX_CACHE_SIZE / 2); i++) {
        const key = iterator.next().value
        LunarMonth._cache.delete(key)
      }
    }
    const key = `${lunarMonth.year}-${lunarMonth.month}`
    LunarMonth._cache.set(key, lunarMonth)
  }
  
  /** 公历年 */
  year: number = 0
  /** 公历月 */
  month: number = 1
  /** 本公历月第一日中午12:00的儒略日数 */
  firstRulue: number = 0
  /** 本公历月月天数 */
  monthDays: number = 30
  /** 本公历月第一日的星期，数字为几就代表周几 */
  firstWeekDay: number = 7
  /** 本公历月的星期数 */
  weekNum: number = 4
  /** 该月的所有日的详细信息 */
  days: LunarDay[] = []
  
  constructor (y: number, m: number) {
    const [year, month] = resolveMonth(y, m)
    
    // 首先从缓存中寻找
    const monthObj = LunarMonth._getFromCache(year, month)
    if (monthObj) {
      return monthObj
    }

    this._init(year, month)
  }

  /** 初始化 */
  private _init (year: number, month: number) {
    this.year = year
    this.month = month
    // 月首儒略日
    this.firstRulue = Math.floor(date2Rulue([year, month, 1, 12, 0, 1])) - J2000
    // 计算本月天数
    const [ny, nm] = resolveMonth(year, month + 1)
    this.monthDays = Math.floor(date2Rulue([ny, nm, 1, 12, 0, 0.1])) - J2000 - this.firstRulue

    // 本月首日周几
    this.firstWeekDay = (this.firstRulue + J2000 + 1) % 7
    // 本月周数
    this.weekNum = Math.floor((this.firstWeekDay + this.monthDays - 1) / 7) + 1
    
    LunarMonth._setToCache(this)
  }
  
  /** 遍历所有的日，在回调函数中进行一定的操作 */
  traveDays (callback: (index: number, monthObj: LunarMonth) => void) {
    for (let i = 0; i < this.monthDays; i++) {
      if (typeof callback === 'function') {
        callback(i, this)
      }
    }
  }
}