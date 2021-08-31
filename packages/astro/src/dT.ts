/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-06 23:48:08
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-26 17:49:43
 * @Description: 计算力学时DELTA T，算法来自寿星万年历源码，涉及天文专业，不建议更改
 */
import { DT_AT } from './common/dataDT'

// 二次曲线外推
function dtExt (y: number, jsd: number): number {
  const dy = (y - 1820) / 100
  return jsd * dy * dy - 20
}

/**
 * 计算某年的世界时与原子时之差
 * @param y 公历年份
 */
export function yearDt (y: number): number {
  const len = DT_AT.length
  // 表中最后一年
  const y0 = DT_AT[len - 2]
  // 表中最后一年的deltatT
  const t0 = DT_AT[len - 1]
  if (y >= y0) {
    // jsd是y1年之后的加速度估计。瑞士星历表jsd=31,NASA网站jsd=32,skmap的jsd=29
    const jsd = 31
    // 二次曲线外推
    const v = dtExt(y, jsd)
    if (y > y0 + 100) { return v }

    // ye年的二次外推与te的差
    const dv = dtExt(y0, jsd) - t0
    return v - dv * (y0 + 100 - y) / 100
  }

  let index: number = 0
  for (let i = 0; i < len; i = i + 5) {
    if (y < DT_AT[i + 5]) {
      index = i
      break
    }
  }

  const t1 = (y - DT_AT[index]) / (DT_AT[index + 5] - DT_AT[index]) * 10
  return DT_AT[index + 1] + DT_AT[index + 2] * t1 + DT_AT[index + 3] * t1 * t1 + DT_AT[index + 4] * t1 * t1 * t1
}

/**
 * 传入儒略日(J2000起算)，计算TD-UT(单位:日)
 * @param rulue
 */
export function rulueDt (rulue: number): number {
  return yearDt(rulue / 365.2425 + 2000) / 86400
}