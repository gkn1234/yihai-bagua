/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-27 19:20:46
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-28 18:20:26
 * @Description: 农历日历
 */
import { rulue2Date } from '@yhbagua/astro'
import {
  DEFAULT_SOLAR,
  SolarIndex,
  YEAR_DAYS_EST,
  QI_DAYS_EST
} from '../common/consts'

import {
  LUNAR_DAYS,
  GAN, ZHI, QI_NAMES
} from '../common/data'

import { year2Ganzhi, resolveMonth } from '../common/utils'
import { 
  LunarYear,
  QI_HEAD_INDEX,
  SHUO_LIST_LEN
} from './LunarYear'

import { LunarMonth } from './LunarMonth'

// 基础的农历日对象
export class LunarDay {
  /** 儒略日，严格来说中午12:00的儒略日数 */
  rulue: number = 0
  /** 本公历月第一日中午12:00的儒略日数 */
  firstRulue: number = 0
  /** 当日序号，即距离公历日首的偏移量 */
  dayIndex: number = 0
  /** 公历年 */
  year: number = DEFAULT_SOLAR[SolarIndex.year]
  /** 公历月 */
  month: number = DEFAULT_SOLAR[SolarIndex.month]
  /** 公历日号，与dayIndex并不简单是相差1的关系 */
  day: number = DEFAULT_SOLAR[SolarIndex.day]
  /** 本公历月月天数 */
  monthDays: number = 30
  /** 当前日的星期 */
  weekDay: number = 7
  /** 本日所在的周在当前公历月的序号 */
  weekIndex: number = 0
  /** 本公历月的星期数 */
  weekNum: number = 4
  /** 本公历月第一日的星期，数字为几就代表周几 */
  firstWeekDay: number = 7
  /** 距离农历日首的偏移量 */
  lunarDayIndex: number = 0
  /** 农历日名称 */
  lunarDay: string = ''
  /** 农历月天数 */
  lunarMonthDays: number = 30
  /** 农历月名称 */
  lunarMonth: string = ''
  // 下一个农历月的名称，用于判断除夕参考，没有更广泛的用途
  nextLunarMonth: string = ''
  /** 所在农历月是否为闰月 */
  isLunarMonthLeap: boolean = false

  // 干支历
  /** 农历纪年及其干支，以大年初一定年首 */
  lunarYear: number = 0
  lunarYearGanzhi: string = ''
  /** 农历纪年及其干支，以【历法节气】的立春定年首。 */
  lunarYearSpring: number = 0
  lunarYearSpringGanzhi: string = ''
  /** 农历纪年及其干支，以【历法节气】的冬至定年首。 */
  lunarYearWinter: number = 0
  lunarYearWinterGanzhi: string = ''
  
  /** 纪月干支，以【历法节气】为参考 */
  monthGanzhi: string = ''
  /** 纪日干支 */
  dayGanzhi: string = ''

  /** 当日节气 */
  qi: string = ''
  /** 节假日以及重大事件，按重要程度排序，越靠前越重要 */
  events = []
  /** 是否放假 */
  isHoliday: boolean = false
  
  constructor (y: number, m: number, index: number) {
    const [year, month] = resolveMonth(y, m)
    index = Math.floor(index)
    
    this._init(year, month, index)
  }

  /** 初始化 */
  private _init (year: number, month: number, index: number) {
    const monthObj = new LunarMonth(year, month)
    
    this.year = year
    this.month = month
    
    if (index >= monthObj.monthDays) {
      throw new Error('Day index is out of range!')
    }
    this.dayIndex = index
    
    // 处理基础
    this._initBase()
    // 处理农历相关
    this._initLunar()
    // 处理干支历
    this._initGanzhiYear()
    this._initGanzhiMonth()
    this._initGanzhiDay()
    // 处理重要事件
    // this._initEvents()
    
    // 加入月对象中
    if (!monthObj.days[index]) {
      monthObj.days[index] = this
    }
  }

  /** 基础信息初始化 */
  private _initBase () {
    const monthObj = new LunarMonth(this.year, this.month)
    this.firstRulue = monthObj.firstRulue
    this.monthDays = monthObj.monthDays
    this.firstWeekDay = monthObj.firstWeekDay
    this.weekNum = monthObj.weekNum

    this.rulue = this.firstRulue + this.dayIndex
    this.weekDay = (this.firstWeekDay + this.dayIndex) % 7
    this.weekIndex = Math.floor((this.firstWeekDay + this.dayIndex) / 7)
    const date = rulue2Date(this.rulue)
    this.day = date[SolarIndex.day]
  }

  /** 处理农历月相关信息 */
  private _initLunar () {
    let yearObj = new LunarYear(this.year)
    if (this.rulue > yearObj.tradQiList[yearObj.tradQiList.length - 1]) {
      // 过了今年的冬至，进入了明年的节气
      yearObj = new LunarYear(this.year + 1)
    }

    // 农历所在月的序数
    let lunarIndex = Math.floor((this.rulue - yearObj.tradShuoList[0]) / 30)
    if (lunarIndex < 13 && yearObj.tradShuoList[lunarIndex + 1] <= this.rulue) {
      lunarIndex++
    }
    // 距离农历日首的偏移量
    this.lunarDayIndex = this.rulue - yearObj.tradShuoList[lunarIndex]
    // 农历日名称
    this.lunarDay = LUNAR_DAYS[this.lunarDayIndex]
    // 农历月名称
    this.lunarMonth = yearObj.lunarMonthNames[lunarIndex]
    // 农历月天数
    this.lunarMonthDays = yearObj.lunarMonthDays[lunarIndex]
    // 闰月状况
    this.isLunarMonthLeap = yearObj.leap > 0 && yearObj.leap === lunarIndex ? true : false
    // 下个月名称，只是用于计算节日
    this.nextLunarMonth = lunarIndex < 13 ? yearObj.lunarMonthNames[lunarIndex + 1] : '未知'
  }

  /** 处理干支纪年，基本保持了寿星万年历的原本算法，不易改动 */
  private _initGanzhiYear () {
    let yearObj = new LunarYear(this.year)
    // 以立春为分界，【历法气】的纪年
    const lichunIndex = LunarYear.qi2Index('立春')
    let lichunRulue = yearObj.tradQiList[lichunIndex]
    let dRulue = lichunRulue + (this.rulue < lichunRulue ? -365 : 0) + 365.25 * 16 - 35
    this.lunarYearQi = Math.round(dRulue / YEAR_DAYS_EST) + 1984
    this.lunarYearQiGanzhi = yearGanzhi(this.lunarYearQi)

    // 以大年初一为分界，一般第三个月是春节，大年初一以历史的【历法朔】为准，不会参考【天文朔】
    dRulue = yearObj.tradShuoList[2]
    for (let j = 0; j < SHUO_LIST_LEN - 1; j++) {
      if (yearObj.lunarMonthNames[j] !== '正' || yearObj.leap === j && j > 0) { continue }
      dRulue = yearObj.tradShuoList[j]
      if (this.rulue < dRulue) {
        dRulue = dRulue - 365
        break
      }
    }
    // 计算该年春节与1984年平均春节(立春附近)相差天数估计
    dRulue = dRulue + 5810
    this.lunarYear = Math.round(dRulue / YEAR_DAYS_EST) + 1984
    this.lunarYearGanzhi = year2Ganzhi(this.lunarYear)
  }

  // 处理干支纪月
  private _initGanzhiMonth () {
    let yearObj = new LunarYear(this.y)

    // 【历法气纪月】
    let mk = Math.floor((this.rulue - yearObj.tradQiList[QI_HEAD_INDEX]) / (2 * QI_DAYS_EST))
    if (mk < 12 && this.rulue >= yearObj.tradQiList[2 * mk + 1 + QI_HEAD_INDEX]) {
      mk++
    }
    // 相对于1998年12月7(大雪)的月数,900000为正数基数
    let dMonth = mk + Math.floor((yearObj.tradQiList[QI_HEAD_INDEX + 12] + 390) / YEAR_DAYS_EST) * 12 + 900000
    this.monthGanzhi = GAN[dMonth % GAN.length] + ZHI[dMonth % ZHI.length]
  }

  // 处理干支纪日，2000年1月7日起算
  private _initGanzhiDay () {
    // 处理干支纪日，2000年1月7日起算
    let dRulue = this.rulue - 6 + 9000000
    this.dayGanzhi = GAN[dRulue % GAN.length] + ZHI[dRulue % ZHI.length]
  }
}