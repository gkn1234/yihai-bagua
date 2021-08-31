/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-26 17:36:02
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-27 19:16:40
 * @Description: 
 */
/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-07 11:50:42
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-07 12:01:29
 * @Description: 
 */
// 以下为天文常数
export const PI: number = Math.PI

/**
 * 各种角度单位转化
 * RAD: 弧度
 * DEG 角度
 * MIN 分
 * SEC 秒
 */
export const DEG_TO_MIN: number = 60
export const MIN_TO_SEC: number = 60

export const RAD_TO_DEG: number = 180 / PI
export const RAD_TO_MIN: number = RAD_TO_DEG * DEG_TO_MIN
export const RAD_TO_SEC: number = RAD_TO_MIN * MIN_TO_SEC

// 以2000年为儒略偏移参照的日数
export const J2000: number = 2451545