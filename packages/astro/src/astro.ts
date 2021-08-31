/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-06 23:50:52
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-27 18:18:27
 * @Description: 天文算法，算法来自寿星万年历源码，涉及天文专业，难以理解，在主体功能不受影响的情况下最好不要轻易更改。
 */
import { EL, ML, NUT_B } from './common/dataAstro'
import { PI, RAD_TO_SEC } from './common/consts'

/** 计算黄经章动 */
export function nutationLon (t: number): number {
  let a
  let dl = 0
  for (let i = 0; i < NUT_B.length; i = i + 5) {
    a = i === 0 ? (-1.742 * t) : 0
    dl = dl + (NUT_B[i + 3] + a) * Math.sin(NUT_B[i] + NUT_B[i+1] * t + NUT_B[i + 2] * t * t)
  }
  return dl / 100 / RAD_TO_SEC
}

/** 黄经光行差 aberration of sun lontitude */
export function abrSunLon (t: number): number {
  // 平近点角
  let v = -0.043126 + 628.301955 * t - 0.000002732 * t * t
  let e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t
  return (-20.49552 * (1 + e * Math.cos(v))) / RAD_TO_SEC
}
/** 黄纬光行差 aberration of sun lattitude */
export function abrSunLat (): number { return 0 }
/** 月球经度光行差,误差0.07" */
export function abrMoonLon (): number { return -3.4e-6 }
/** 月球纬度光行差,误差0.006" */
export function abrMoonLat (t: number): number {
  return 0.063 * Math.sin(0.057 + 8433.4662 * t + 0.000064 * t * t) / RAD_TO_SEC
}

/**
 * 计算地球星历 ephemeris of earth
 * @param zn 坐标号
 * @param t 儒略世纪数
 * @param n 计算项数
 */
export function ephEarth (zn: number, t: number, n: number): number {
  t = t / 10 //转为儒略千年数

  let pn = zn * 6 + 1
  let n0, n1, n2, N
  let N0 = EL[pn + 1] - EL[pn]
  let tn = 1
  let v = 0
  for (let i = 0; i < 6; i++, tn = tn * t) {
    n1 = EL[pn + i]
    n2 = EL[pn + 1 + i]
    n0 = n2 - n1

    if (!n0) { continue }

    if (n < 0) { N = n2 }
    else {
      N = Math.floor(3 * n * n0 / N0 + 0.5) + n1
      if (i) { N = N + 3 }
      if (N > n2) { N = n2 }
    }

    let c = 0
    for (let j = n1; j < N; j = j + 3) {
      c = c + EL[j] * Math.cos(EL[j + 1] + t * EL[j + 2])
    }

    v = v + c * tn
  }

  v = v / EL[0]

  // 地球
  if (zn === 0) { v = v + (-0.0728 - 2.7702 * t - 1.1019 * t * t - 0.0996 * t * t * t) / RAD_TO_SEC }
  if (zn === 1) { v = v + (0.0000 + 0.0004 * t + 0.0004 * t * t - 0.0026 * t * t * t) / RAD_TO_SEC }
  if (zn === 2) { v = v + (0.0020 + 0.0044 * t + 0.0213 * t * t - 0.0250 * t * t * t) / 1000000 }
  // 其他行星的修正部分删除

  return v
}

/**
 * 计算月亮星历 ephemeris of moon
 * @param zn 坐标号
 * @param t 儒略世纪数
 * @param n 计算项数
 */
export function ephMoon (zn: number, t: number, n: number): number {
  const ob = ML[zn]

  let v = 0
  let t2 = t * t, t3 = t2 * t, t4 = t3 * t, t5 = t4 * t, tx = t - 10
  if (zn === 0) {
    // 月球平黄经(弧度)
    v = v + (3.81034409 + 8399.684730072 * t - 3.319e-05 * t2 + 3.11e-08 * t3 - 2.033e-10 * t4) * RAD_TO_SEC
    // 岁差(角秒)
    v = v + 5028.792262 * t + 1.1124406 * t2 + 0.00007699 * t3 - 0.000023479 * t4 -0.0000000178 * t5
    // 对公元3000年至公元5000年的拟合,最大误差小于10角秒
    if (tx > 0) {
      v = v - 0.866 + 1.43 * tx + 0.054 * tx * tx
    }
  }

  t2 = t2 / 1e4
  t3 = t3 / 1e8
  t4 = t4 / 1e8
  n = n * 6
  if (n < 0) {
    n = ob[0].length
  }

  let tn = 1
  for (let i = 0; i < ob.length; i++, tn = tn * t) {
    const F = ob[i]
    let N = Math.floor(n * F.length / ob[0].length + 0.5)
    if (i) { N = N + 6 }
    if (N > F.length) { N = F.length }

    let c = 0
    for (let j = 0; j < N; j = j + 6) {
      c = c + F[j] * Math.cos(F[j + 1] + t * F[j + 2] + t2 * F[j + 3] + t3 * F[j + 4] + t4 * F[j + 5])
    }
    v = v + c * tn
  }

  if (zn !== 2) {
    v = v / RAD_TO_SEC
  }

  return v
}

/**
 * 地球黄经计算
 * @param t 儒略世纪数
 * @param n 计算项数
 */
export function earthLon (t: number, n: number): number {
  return ephEarth(0, t, n)
}
/**
 * 月球黄经计算
 * @param t 儒略世纪数
 * @param n 计算项数
 */
export function moonLon (t: number, n: number): number {
  return ephMoon(0, t, n)
}

/**
 * 地球速度，误差小于万分3
 * @param t 儒略世纪数
 */
export function vEarth (t: number): number {
  const f = 628.307585 * t
  return 628.332 + 21 * Math.sin(1.527 + f)
    + 0.44 * Math.sin(1.48 + f * 2)
    + 0.129 * Math.sin(5.82 + f) * t
    + 0.00055 * Math.sin(4.21 + f) * t * t
}

/**
 * 月球速度计算，误差小于千分之三
 * @param t 儒略世纪数
 */
export function vMoon (t: number): number {
  let v = 8399.71 - 914 * Math.sin(0.7848 + 8328.691425 * t + 0.0001523 * t * t)
  return v - 179 * Math.sin(2.543 + 15542.7543 * t)
    - 160 * Math.sin(0.1874 + 7214.0629 * t)
    - 62 * Math.sin(3.14 + 16657.3828 * t)
    - 34 * Math.sin(4.827 + 16866.9323 * t)
    - 22 * Math.sin(4.9 + 23871.4457 * t)
    - 12 * Math.sin(2.59 + 14914.4523 * t)
    - 7 * Math.sin(0.23 + 6585.7609 * t)
    - 5 * Math.sin(0.9 + 25195.624 * t)
    - 5 * Math.sin(2.32 - 7700.3895 * t)
    - 5 * Math.sin(3.88 + 8956.9934 * t)
    - 5 * Math.sin(0.49 + 7771.3771 * t)
}

/**
 * 计算太阳视黄经，sun apparent longitude
 * @param t 儒略世纪数
 * @param n 计算项数
 */
export function aLonSun (t: number, n: number): number {
  // 注意，这里的章动计算很耗时
  return earthLon(t, n) + nutationLon(t) + abrSunLon(t) + PI 
}
/**
 * 月日视黄经的差值
 * @param t 儒略世纪数
 * @param mn 月亮计算项数
 * @param sn 太阳计算项数
 */
export function aLonMoonSun (t: number, mn: number, sn: number): number {
  return moonLon(t, mn) + abrMoonLon() - (earthLon(t, sn) + abrSunLon(t) + PI)
}

/**
 * 已知太阳视黄经求时间
 * @param angle 太阳视黄经
 */
export function aLon2TimeSun (angle: number): number {
  let v= 628.3319653318
  let t = (angle - 1.75347 - PI) / v
  v = vEarth(t)
  t = t + (angle - aLonSun(t, 10)) / v
  v = vEarth(t)
  t = t + (angle - aLonSun(t, -1)) / v
  return t
}
/**
 * 已知月日视黄经差求时间
 * @param angle 日月视黄经差
 */
export function aLon2TimeMoonSun (angle: number): number {
  let v = 7771.37714500204
  let t = (angle + 1.08472) / v
  t = t + (angle - aLonMoonSun(t, 3, 3)) / v
  v = vMoon(t) - vEarth(t)
  t = t + (angle - aLonMoonSun(t, 20, 10)) / v
  t = t + (angle - aLonMoonSun(t, -1, 60)) / v
  return t
}
/**
 * 已知太阳视黄经求时间，高速低精，最大误差不超过600秒
 * @param angle 太阳视黄经
 */
 export function aLon2TimeSun_ex (angle: number): number {
  let v = 628.3319653318
  let t = (angle - 1.75347 - PI) / v
  t = t - (0.000005297 * t * t
    + 0.0334166 * Math.cos(4.669257 + 628.307585 * t)
    + 0.0002061 * Math.cos(2.67823  + 628.307585 * t) *t ) / v
  t = t + (angle - earthLon(t, 8) - PI + (20.5 + 17.2 * Math.sin(2.1824 - 33.75705 * t)) / RAD_TO_SEC) / v
  return t
}
/**
 * 已知月日视黄经差求时间，高速低精度，误差不超过600秒(只验算了几千年)
 * @param angle 日月视黄经差 
 */
export function aLon2TimeMoonSun_ex (angle: number): number {
  let v = 7771.37714500204
  let t = (angle + 1.08472) / v
  t = t - (-0.00003309 * t * t
    + 0.10976 * Math.cos(0.784758 + 8328.6914246 * t + 0.000152292 * t * t)
    + 0.02224 * Math.cos(0.18740 + 7214.0628654 * t - 0.00021848 * t * t)
    + 0.03342 * Math.cos(4.669257 + 628.307585 * t)) / v
  let L = moonLon(t, 20) - (4.8950632 + 628.3319653318 * t
    + 0.000005297 * t * t
    + 0.0334166 * Math.cos(4.669257 + 628.307585 * t)
    + 0.0002061 * Math.cos(2.67823 + 628.307585 * t) * t
    + 0.000349 * Math.cos(4.6261 + 1256.61517 * t) - 20.5 / RAD_TO_SEC)
  v = 7771.38 - 914 * Math.sin(0.7848 + 8328.691425 * t + 0.0001523 * t * t) - 179 * Math.sin(2.543 + 15542.7543 * t) - 160 * Math.sin(0.1874 + 7214.0629 * t)
  return t + (angle - L) / v
}