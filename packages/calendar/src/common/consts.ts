/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-27 18:43:58
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-28 17:43:23
 * @Description: 
 */
import { SolarArr } from './types'
// 日期数组的各对象索引
export enum SolarIndex {
  year = 0,
  month = 1,
  day = 2,
  hour = 3,
  min = 4,
  second = 5
}
/** 默认的公历日期对象 */
export const DEFAULT_SOLAR: SolarArr = [0, 1, 1, 0, 0, 0]

/** 时间转换率 */
export const YEAR_TO_MONTH: number = 12
export const DAY_TO_HOUR: number  = 24
export const HOUR_TO_MIN: number  = 60
export const MIN_TO_SEC: number  = 60
export const WEEK_TO_DAY: number = 7

/** 估算日数 */
// 一年日数估算
export const YEAR_DAYS_EST: number = 365.2422
// 一个月的日数估算
export const MONTH_DAYS_EST: number = 29.5306
// 一个节气的日数估算
export const QI_DAYS_EST: number = 15.218425