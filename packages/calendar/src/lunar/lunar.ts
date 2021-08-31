/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-28 16:41:59
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-28 18:30:25
 * @Description: 导出供公用的农历方法
 */
import { LUNAR_NAMES } from '../common/data'
import { LunarYear, QI_HEAD_INDEX } from './LunarYear'
import { LunarMonth } from './LunarMonth'
import { LunarDay } from './LunarDay'

export interface LunarYearData {
  /** 农历月份名称 */
  monthNames: string[]
  /** 农历每月天数 */
  monthDays: number[]
  /** 闰月位置 */
  leap: number
  /** 初一儒略日【历法朔】 */
  tradShuo: number[]
  /** 精确初一儒略日【天文朔】 */
  shuo: number[]
}
/**
 * 给定公历年，获取对应农历年正月到明年正月之间所有月份的名称与信息
 * @param year 
 * @param isDetail 是否输出精细化数据，此模式开启后将输出每个初一的精确时间，即【天文朔】
 */
export function getLunars (year: number, isDetail: boolean = false): LunarYearData {
  const thisYear = new LunarYear(year)
  // 有闰月时，表中前13个数据有效(落在两个冬至之间的农历月)，否则只有12个数据
  const yearNum = thisYear.leap === 0 ? 12 : 13
  // 正月位置
  let headIndex = thisYear.lunarMonthNames.indexOf(LUNAR_NAMES[2])

  // 截取当年有效的数据
  let monthDays = thisYear.lunarMonthDays.slice(headIndex, yearNum)
  let monthNames = thisYear.lunarMonthNames.slice(headIndex, yearNum)
  let leap = thisYear.leap === 0 ? 0 : thisYear.leap - headIndex
  let tradShuo = thisYear.tradShuoList.slice(headIndex, yearNum)
  let shuo: number[] = []
  if (isDetail) {
    thisYear.accurateShuo()
    shuo = thisYear.shuoList.slice(headIndex, yearNum)
  }

  // 去下一年截取数据，并找到正月位置
  const nextYear = new LunarYear(year + 1)
  headIndex = nextYear.lunarMonthNames.indexOf(LUNAR_NAMES[2])

  // 合并数据
  if (nextYear.leap < headIndex && nextYear.leap > 0) {
    leap = nextYear.leap + monthDays.length
  }
  monthDays = monthDays.concat(nextYear.lunarMonthDays.slice(0, headIndex))
  monthNames = monthNames.concat(nextYear.lunarMonthNames.slice(0, headIndex))
  tradShuo = tradShuo.concat(nextYear.tradShuoList.slice(0, headIndex))
  if (isDetail) {
    nextYear.accurateShuo()
    shuo = shuo.concat(nextYear.shuoList.slice(0, headIndex))
  }

  return { 
    monthDays,
    monthNames,
    leap,
    tradShuo,
    shuo,
  }
}

export interface YearQiData {
  /** 每个节气的估算儒略日【历法气】 */
  tradQi: number[]
  /** 精确节气儒略日【天文气】 */
  qi: number[]
}
/**
 * 给定公历年，获取前一个冬至到后一个立春的所有节气数据
 * @param year 
 * @param isDetail 是否输出精细化数据，此模式开启后将计算每个节气的精确时间，即【天文气】
 */
export function getYearQi (year: number, isDetail: boolean = false): YearQiData {
  const thisYear = new LunarYear(year)
  const nextYear = new LunarYear(year + 1)
  const tradQiThisYear = thisYear.tradQiList.slice(QI_HEAD_INDEX)
  const tradQiNextYear = nextYear.tradQiList.slice(0, QI_HEAD_INDEX)
  let tradQi = tradQiThisYear.concat(tradQiNextYear)
  let qi: number[] = []
  if (isDetail) {
    const qiThisYear = thisYear.qiList.slice(QI_HEAD_INDEX)
    const qiNextYear = nextYear.qiList.slice(0, QI_HEAD_INDEX)
    qi = qiThisYear.concat(qiNextYear)
  }

  return { tradQi, qi }
}

/** 给定公历年月，输出当月数据 */
export function getMonth (year: number, month: number): LunarMonth {
  const monthObj = new LunarMonth(year, month)
  monthObj.traveDays((index) => {
    new LunarDay(year, month, index)
  })
  return monthObj
}