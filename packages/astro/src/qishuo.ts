/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-06 23:48:25
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-26 17:50:04
 * @Description: 气朔计算方法，算法来自寿星万年历源码，涉及天文专业，不建议更改
 */
import { QI_KB, SHUO_KB, QI_FIX, SHUO_FIX } from './common/dataQishuo'
import { J2000, PI } from './common/consts'
import { 
  aLon2TimeMoonSun,
  aLon2TimeMoonSun_ex,
  aLon2TimeSun,
  aLon2TimeSun_ex
} from './astro'
import { rulueDt } from './dT'

/**
 * 低精度定朔计算,在2000年至600，误差在2小时以内(仍比古代日历精准很多)
 * @param angle 角度
 */
export function shuoLow (angle: number): number {
  const v = 7771.37714500204
  let t  = (angle + 1.08472) / v
  t = t - (-0.0000331 * t * t
    + 0.10976 * Math.cos(0.785 + 8328.6914 * t)
    + 0.02224 * Math.cos(0.187 + 7214.0629 * t)
    - 0.03342 * Math.cos(4.669 +  628.3076 * t)) / v
    + (32 * (1.8 + t) * (1.8 + t) - 20) / 86400 / 36525
  return t * 36525 + 8 / 24
}

/**
 * 低精度的定气计算，最大误差小于30分钟，平均5分
 * @param angle 角度
 */
 export function qiLow (angle: number): number {
  let v = 628.3319653318
  // 第一次估算,误差2天以内
  let t = (angle - 4.895062166) / v
  // 第二次估算,误差2小时以内
  t = t - (53 * t * t + 334116 * Math.cos(4.67 + 628.307585 * t) + 2061 * Math.cos(2.678 + 628.3076 * t) * t) / v / 10000000

  let L = 48950621.66 + 6283319653.318 * t + 53 * t * t // 平黄经
    + 334166 * Math.cos(4.669257 + 628.307585 * t) // 地球椭圆轨道级数展开
    + 3489 * Math.cos(4.6261 + 1256.61517 * t) // 地球椭圆轨道级数展开
    + 2060.6 * Math.cos(2.67823 + 628.307585 * t) * t  // 一次泊松项
    - 994 - 834 * Math.sin(2.1824 - 33.75705 * t) // 光行差与章动修正
  
  t = t - (L / 10000000 - angle) / 628.332 + (32 * (t + 1.8) * (t + 1.8) - 20) / 86400 / 36525
  return t * 36525 + 8 / 24
}

/**
 * 高精度朔
 * @param angle 角度
 */
export function shuoHigh (angle: number): number {
  let t = aLon2TimeMoonSun_ex(angle) * 36525
  t = t - rulueDt(t) + 8 / 24
  let v = ((t + 0.5) % 1) * 86400
  if(v < 1800 || v > 86400 - 1800) {
    t = aLon2TimeMoonSun(angle) * 36525 - rulueDt(t) + 8 / 24
  } 
  return t
}

// 高精度气
export function qiHigh (angle: number): number {
  let t = aLon2TimeSun_ex(angle) * 36525
  t = t - rulueDt(t) + 8 / 24
  let v = ((t + 0.5) % 1) * 86400
  if (v < 1200 || v > 86400 - 1200) {
    t = aLon2TimeSun(angle) * 36525 - rulueDt(t) + 8 / 24
  } 
  return  t
}

// 根据角度获取精气
export function qiAccurateFromAngle (angle: number): number {
  const t = aLon2TimeSun(angle) * 36525
  return t - rulueDt(t) + 8 / 24
}

// 根据角度获取精朔
export function shuoAccurateFromAngle (angle: number): number {
  const t = aLon2TimeMoonSun(angle) * 36525
  return t - rulueDt(t) + 8 / 24
}


// 校准气对应的儒略日，高精度
export function qiAccurate (jd: number): number {
  const angle = Math.floor((jd + 293) / 365.2422 * 24) * PI / 12
  return qiAccurateFromAngle(angle)
}

// 校准朔对应的儒略日，高精度
export function shuoAccurate (jd: number): number {
  const angle = Math.floor((jd + 8) / 29.5306) * PI * 2
  return shuoAccurateFromAngle(angle)
}

/**
 * 气朔估算，精确到日
 * @param jd J2000起算的儒略日，应靠近所要取得的气朔日
 * @param isQi 是否为定气计算，为true定气，反之定朔
 * @returns 气朔对应的【常规儒略日】，只是四舍五入后的粗略值，想要得到精确值还需进一步通过【校准方法】计算。
 */
 export function estimateQishuo (jd: number, isQi: boolean = true): number {
  jd = jd + J2000
  const KB = isQi ? QI_KB : SHUO_KB
  const pc = isQi ? 7 : 14
  // 需要分阶段按不同方法计算气朔，不同阶段
  const section1 = KB[0] - pc, section2 = KB[KB.length - 1] - pc, section3 = 2436935

  if (jd >= section1 && jd < section2) {
    // 平气或平朔
    let index: number = 0
    for (let i = 0; i < KB.length; i = i + 2) {
      if (jd + pc < KB[i + 2]) {
        index = i
        break
      }
    }

    let d = KB[index] + KB[index + 1] * Math.floor((jd + pc - KB[index]) / KB[index + 1])
    d = Math.round(d)
    // 如果使用太初历计算-103年1月24日的朔日,结果得到的是23日,这里修正为24日(实历)。修正后仍不影响-103的无中置闰。如果使用秦汉历，得到的是24日，本行D不会被执行。
    if (d === 1683460) { d++ }
    return d - J2000
  }
  else if (jd >= section2 && jd < section3) {
    // 定气或定朔
    let d, fix
    if (isQi) {
      // 2451259是1999.3.21,太阳视黄经为0,春分.定气计算
      const angle = Math.floor((jd + pc - 2451259) / 365.2422 * 24) * PI / 12
      d = Math.round(qiLow(angle))
      // 找定气修正值
      fix = QI_FIX.substr(Math.floor((jd - section2) / 365.2422 * 24), 1)
    }
    else {
      // 2451551是2000.1.7的那个朔日,黄经差为0.定朔计算
      const angle = Math.floor((jd + pc - 2451551) / 29.5306) * PI * 2
      d = Math.round(shuoLow(angle))
      // 找定朔修正值
      fix = SHUO_FIX.substr(Math.floor((jd - section2) / 29.5306), 1)
    }

    if (fix === '1') { return d + 1 }
    if (fix === '2') { return d - 1 }
    return d
  }

  // 平气朔表中首个之前，使用现代天文算法。1960.1.1以后，使用现代天文算法 (这一部分调用了qi_high和so_high,所以需星历表支持)
  // 隐含判断条件 jd < section1 || jd >= section3
  if (isQi) {
    const angle = Math.floor((jd + pc - 2451259) / 365.2422 * 24) * PI / 12
    return Math.round(qiHigh(angle))
  }
  const angle = Math.floor((jd + pc - 2451551) / 29.5306) * PI * 2
  return Math.round(shuoHigh(angle))
}