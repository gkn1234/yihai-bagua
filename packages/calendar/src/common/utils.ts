/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-27 18:09:23
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-28 17:46:20
 * @Description: 
 */
import { SolarArr } from './types'
import { 
  SolarIndex,
  YEAR_TO_MONTH
} from './consts'

import {
  GAN, ZHI
} from './data'

/**
 * 规格化年月输入，忽略小数位，确保月份数在1-12。对month参数作加减法可以起到月份偏移的作用
 * @param year 
 * @param month 
 * @returns 返回数组 [year, month]
 */
export function resolveMonth (year: number, month: number): [number, number] {
  month = Math.floor(month) - 1
  year += Math.floor(month / YEAR_TO_MONTH)
  month = (month % YEAR_TO_MONTH) + 1
  return [year, month]
}

/**
 * 输入年份，得到对应干支
 * @param y
 */
export function year2Ganzhi (year: number): string {
  const standard = year - 1984 + 9000
  return GAN[standard % GAN.length] + ZHI[standard % ZHI.length]
}

/**
 * 将公历数据，按照指定格式转化为字符串
 * @param solar 公历数据
 * @param format 转化成字符串的格式，如 y-M-d h:m:s | YY/MM/dd hh:mm:ss | y-M-d(只输出到日)
 */
export function solarStr (solar: SolarArr, format: string = 'y-mm-dd hh:mm:ss'): string {
  // 默认模式匹配 y-MM-dd hh:mm:ss
  let formatArr = ['y', '-', 'MM', '-', 'dd', ' ', 'hh', ':', 'mm', ':', 'ss', '']
  if (typeof format === 'string') {
    const resolvedFormat = _resolveFormat(format)
    if (resolvedFormat) {
      formatArr = resolvedFormat.slice(1, resolvedFormat.length)
    }
  }
  
  let result = ''
  for (let i = 0; i < formatArr.length; i = i + 2) {
    // 该日期元素后面的连接符号
    const connector = formatArr[i + 1]
    // 该日期元素限制长度
    const limitLen = formatArr[i].length
    // 获取日期元素
    let section = String(Math.abs(solar[i / 2]))
    // 需要补0的数量
    const lackZeroNum = section.length >= limitLen ? 0 : limitLen - section.length
    // 进行补0
    for (let j = 0; j < lackZeroNum; j++) {
      section = '0' + section
    }
    // 负数年份处理
    if (i === SolarIndex.year && solar[i / 2] < 0) {
      section = '-' + section
    }
    // 连接字符串
    section += connector
    result += section
  }
  return result
}
/** 模式匹配正则列表 */
const _formatRegList: RegExp[] = [
  /^([Y|y]+)(.*?)([M|m]+)(.*?)([D|d]+)(.*?)([H|h]+)(.*?)([M|m]+)(.*?)([S|s]+)(.*?)$/,
  /^([Y|y]+)(.*?)([M|m]+)(.*?)([D|d]+)(.*?)([H|h]+)(.*?)([M|m]+)(.*?)$/,
  /^([Y|y]+)(.*?)([M|m]+)(.*?)([D|d]+)(.*?)([H|h]+)(.*?)$/,
  /^([Y|y]+)(.*?)([M|m]+)(.*?)([D|d]+)(.*?)$/,
  /^([Y|y]+)(.*?)([M|m]+)(.*?)$/,
  /^([Y|y]+)(.*?)$/
]
/** 解析公历输出模式串 */
function _resolveFormat (format: string): RegExpMatchArray | null {
  for (let i = 0; i < _formatRegList.length; i++) {
    const result = format.match(_formatRegList[i])
    if (result) {
      return result
    }
  }
  return null
}