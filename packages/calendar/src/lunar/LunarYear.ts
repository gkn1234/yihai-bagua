/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-27 19:19:55
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-28 19:01:35
 * @Description: 农历年历
 */
import {
  J2000, 
  date2Rulue,
  estimateQishuo,
  qiAccurate,
  shuoAccurate
} from '@yhbagua/astro'

import {
  YEAR_DAYS_EST,
  MONTH_DAYS_EST,
  QI_DAYS_EST,
  DEFAULT_SOLAR,
  SolarIndex
} from '../common/consts'

import {
  LUNAR_NAMES,
  QI_NAMES,
} from '../common/data'

/**
 * 【节气表长度说明】
 * 1. 节气表长度为27，所包含的节气从去年小雪，到今年冬至，一共27个节气(此处所说年为公历年)
 * 2. 其中0代表去年小雪，1代表去年大雪，2代表去年冬至，...，26代表今年冬至
 * 3. 去年的小雪和大雪为【补算二气】,确保一年中所有月份的“气”全部被计算在内
 * 
 * 【合朔表长度说明】
 * 全年朔日儒略日估算表，从去年冬至前的朔日到明年正月初一前，一共15个朔日
 */
export const QI_LIST_LEN: number = 27
/** 节气表起始节气的索引(排除【补算二气】) */
export const QI_HEAD_INDEX: number = 2
// 合朔表长度
export const SHUO_LIST_LEN: number = 15

// 缓存最大容量
const MAX_CACHE_SIZE = 100

export class LunarYear {
  /** 缓存计算过的年份 */
  static _cache: Map<number, LunarYear> = new Map()

  /** 从缓存中寻找某年的年历数据 */
  static _getFromCache (year: number): LunarYear | undefined {
    return LunarYear._cache.get(year)
  }

  /** 存入缓存 */
  static _setToCache (lunarYear: LunarYear) {
    const len = LunarYear._cache.size
    if (len === MAX_CACHE_SIZE) {
      // 缓存满后，每次清理前一半的内容
      let iterator = LunarYear._cache.keys()
      for (let i = 0; i < Math.floor(MAX_CACHE_SIZE / 2); i++) {
        const year = iterator.next().value
        LunarYear._cache.delete(year)
      }
    }
    LunarYear._cache.set(lunarYear.year, lunarYear)
  }

  /** 给定节气名称，获取年历表中的索引，不认识的名称统一按【冬至】处理 */
  static qi2Index (name: string) {
    const index = QI_NAMES.indexOf(name)
    return index >= 0 ? QI_HEAD_INDEX + index : 0
  }

  /** 公历年份 */
  year: number = DEFAULT_SOLAR[SolarIndex.year]

  /** 【首气日】估算值，即把冬至看做第一个节气，得到冬至当天(实际上是公历的去年冬至)的估算儒略日 */
  private _estFirstQiDay: number = 0
  /** 【首朔日】估算值，【首朔日】即【首气日】前一个朔日 */
  private _estFirstShuoDay: number = 0

  /**
   * 【历法气朔与天文气朔】
   * 1. 因为中国古代才用过平气平朔的算法，与现代天文算法相比会产生较大的误差。
   * 2. 还原历史的气朔数据为【历法气朔】，完全按照天文算法得出的数据为【天文气朔】。
   * 3. 本程序中，历法气朔通过估算获取，只精确到天，天文气朔精确到秒，并支持文字转化。
   * 4. 为了计算的全面性，两种气朔都会计算。
   * 5. 考虑到传统，农历日期排布将以【历法朔】为准，不会按照天文算法结果进行修正。
   * 6. 考虑到排盘精确到时分的要求，并且与天文相关，起局排盘的干支计算将参考现【天文气】。
   */
  /** 历法气表 */ 
  tradQiList: number[] = []
  /** 天文气表 */
  qiList: number[] = []
  /** 历法朔表 */
  tradShuoList: number[] = []
  /** 天文朔表 */
  shuoList: number[] = []

  /** 闰月位置，为0代表今年没有闰月，不为0时，lunarMonthNames列表中对应位置的月份为闰月 */
  leap: number = 0
  /** 每个农历月的名称，15个朔日共有十四个农历月 */
  lunarMonthNames: string[] = []
  /** 每个农历月的天数，与农历月名称列表长度相等 */
  lunarMonthDays: number[] = []

  constructor (year: number) {
    year = Math.floor(year)

    // 首先从缓存中寻找
    const yearObj = LunarYear._getFromCache(year)
    if (yearObj) {
      return yearObj
    }

    this._init(year)
  }

  /** 初始化 */
  private _init (year: number) {
    this.year = year

    this._estimateQi()
    this._estimateShuo()
    this._initLunarMonths()
    this._setLeap()
    LunarYear._setToCache(this)
  }

  /** 估算【首气日】 */
  private _estimateFirstQi () {
    // 取当年的中间日子 - 6月1日，作为参考儒略日，用于估算冬至首日
    const standardRulue = Math.floor(date2Rulue([this.year, 6, 1, 12, 0, 0.1])) - J2000
    // 355是2000.12冬至,得到较靠近standardRulue的冬至估计值
    this._estFirstQiDay = Math.floor((standardRulue - 355 + 183) / YEAR_DAYS_EST) * YEAR_DAYS_EST + 355
    if (estimateQishuo(this._estFirstQiDay) > standardRulue) {
      // 定位到上一个冬至
      this._estFirstQiDay -= YEAR_DAYS_EST
    }
  }

  /** 估算27个必要节气 */
  private _estimateQi () {
    this._estimateFirstQi()
    for (let i = 0; i < QI_LIST_LEN; i++) {
      const qiOffset = i - QI_HEAD_INDEX
      const estQi = estimateQishuo(this._estFirstQiDay + qiOffset * QI_DAYS_EST)
      this.tradQiList.push(estQi)
    }
  }

  // 估算【首朔日】
  private _estimateFirstShuo () {
    this._estFirstShuoDay = estimateQishuo(this.tradQiList[QI_HEAD_INDEX], false)
    if (this._estFirstShuoDay > this.tradQiList[QI_HEAD_INDEX]) {
      // 【首朔日】在【首气日】之前，进一步进行定位估算
      this._estFirstShuoDay -= MONTH_DAYS_EST
    }
  }

  // 估算所有朔日
  private _estimateShuo () {
    this._estimateFirstShuo()
    for (let i = 0; i < SHUO_LIST_LEN; i++) {
      const estShuo = estimateQishuo(this._estFirstShuoDay + MONTH_DAYS_EST * i, false)
      this.tradShuoList.push(estShuo)
    }
  }

  // 设置闰月
  private _setLeap () {
    if (this.leap > 0) {
      this.lunarMonthNames[this.leap] = '闰' + this.lunarMonthNames[this.leap]
    }
  }

  // 初始化相关的农历月
  private _initLunarMonths () {
    const lunarLen = LUNAR_NAMES.length

    let lunarOrder = []
    // 根据十五个朔日计算十四个农历月的天数
    for (let i = 0; i < SHUO_LIST_LEN - 1; i++) {
      this.lunarMonthDays.push(this.tradShuoList[i + 1] - this.tradShuoList[i])
      // 初始化月建序数
      lunarOrder.push(i)
    }

    /** @attention 从此往下都是寿星万年历算法，主要参考特殊年份的历法对月建、月名称进行调整，看不懂，尽量不修改 */
    const refYear = Math.floor((this.tradQiList[QI_HEAD_INDEX] + 10 + 180) / YEAR_DAYS_EST) + 2000
    // -721年至-104年的后九月及月建问题, 与朔有关，与气无关
    if (refYear >= -721 && refYear <= -104) {
      const ns = new Array()
      for (let i = 0; i < 3; i++) {
        const yy = refYear + i - 1
        if (yy >= -721) {
          // 春秋历,ly为-722.12.17
          // 颁行历年首
          ns[i] = estimateQishuo(1457698 - J2000 + Math.floor(0.342 + (yy + 721) * 12.368422) * MONTH_DAYS_EST, false)
          // 闰月名称
          ns[i + 3] = '十三'
          // 月建序数
          ns[i + 6] = 2
        }
        if (yy >= -479) {
          // 战国历,ly为-480.12.11
          ns[i] = estimateQishuo(1546083 - J2000 + Math.floor(0.500 + (yy + 479) * 12.368422) * MONTH_DAYS_EST, false)
          ns[i + 3] = '十三'
          ns[i + 6] = 2
        }
        if (yy >= -220) {
          // 秦汉历,ly为-221.10.31
          ns[i] = estimateQishuo(1640641 - J2000 + Math.floor(0.866 + (yy + 220) * 12.369000) * MONTH_DAYS_EST, false)
          ns[i + 3] = '后九'
          ns[i + 6] = 11
        }
      }

      for (let i = 0; i < SHUO_LIST_LEN - 1; i++) {
        let sign = 0
        for (let j = 2; j >= 0; j--) {
          if (this.tradShuoList[i] >= ns[j]) {
            sign = j
            break
          }
        }

        // 该月积数
        const order = Math.floor((this.tradShuoList[i] - ns[sign] + SHUO_LIST_LEN) / MONTH_DAYS_EST)
        if (order < 12) {
          this.lunarMonthNames.push(LUNAR_NAMES[(order + ns[sign + 6]) % lunarLen])
        }
        else {
          this.lunarMonthNames.push(ns[sign + 3])
        }
      }
      return
    }

    // 无中气置闰法确定闰月(气朔结合法, 数据源需有冬至开始的的气和朔)
    if (this.tradShuoList[lunarLen + 1] <= this.tradQiList[QI_LIST_LEN - 1]) {
      // 第13月的月末没有超过冬至(不含冬至),说明今年含有13个月
      let sign = 1
      while (this.tradShuoList[sign + 1] > this.tradQiList[2 * sign + QI_HEAD_INDEX] && sign < lunarLen + 1) {
        // 在13个月中找第1个没有中气的月份
        sign++
      }
      this.leap = sign
      for (let i = sign; i < SHUO_LIST_LEN - 1; i++) {
        lunarOrder[i]--
      }
    }

    // 名称转换
    for (let i = 0; i < SHUO_LIST_LEN - 1; i++) {
      // 该农历月份初一儒略日
      const firstLunarRulue = this.tradShuoList[i] + J2000
      // 月建对应的默认月名称：建子十一,建丑十二,建寅为正……
      let name = LUNAR_NAMES[lunarOrder[i] % lunarLen]
      if (
        // 8.01.15 至 23.12.02 建子为十二,其它顺推
        (firstLunarRulue >= 1724360 && firstLunarRulue <= 1729794) ||
        // 237.04.12 至 239.12.13 建子为十二,其它顺推
        (firstLunarRulue >= 1807724 && firstLunarRulue <= 1808699)
      ) {
        name = LUNAR_NAMES[(lunarOrder[i] + 1) % lunarLen]
      }
      else if (firstLunarRulue >= 1999349 && firstLunarRulue <= 1999467) {
        // 761.12.02 至 762.03.30 建子为正月,其它顺推
        name = LUNAR_NAMES[(lunarOrder[i] + 2) % lunarLen]
      }
      else if (firstLunarRulue >= 1973067 && firstLunarRulue <= 1977052) {
        // 689.12.18 至 700.11.15 建子为正月,建寅为一月,其它不变
        if (lunarOrder[i] % lunarLen === 0) { name = '正' }
        if (lunarOrder[i] === 2) { name = '一' }
      }

      if (firstLunarRulue === 1729794 || firstLunarRulue === 1808699) {
        // 239.12.13 及 23.12.02均为十二月,为避免两个连续十二月，此处改名
        name = '拾贰'
      }

      this.lunarMonthNames.push(name)
    }
  }

  /** 获取精气，即计算【天文气】 */
  accurateQi (): LunarYear {
    if (this.qiList.length === this.tradQiList.length) {
      return this
    }

    for (let i = 0; i < QI_LIST_LEN; i++) {
      this.qiList.push(qiAccurate(this.tradQiList[i]))
    }
    return this
  }
  /** 获取精朔，即计算【天文朔】 */
  accurateShuo (): LunarYear {
    if (this.shuoList.length === this.tradShuoList.length) {
      return this
    }

    for (let i = 0; i < SHUO_LIST_LEN; i++) {
      this.shuoList.push(shuoAccurate(this.tradShuoList[i]))
    }
    return this
  }
  /** 同时获取精气精朔 */
  accurateQishuo (): LunarYear {
    return this.accurateQi().accurateShuo()
  }
}