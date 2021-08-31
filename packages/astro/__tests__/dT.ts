/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-27 15:47:42
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-27 15:47:42
 * @Description: 
 */
import { rulueDt } from '@yhbagua/astro'

describe('力学时与世界时差值计算', () => {
  test('计算δT', () => {
    // -500 以前
    expect(rulueDt(-1095873.6) * 1e16).toBeCloseTo(0.29438564653081334 * 1e16)
    // -500 至 500
    expect(rulueDt(-643693.6) * 1e16).toBeCloseTo(0.09586289842373263 * 1e16)
    // 500 至 1600
    expect(rulueDt(-424673.2) * 1e16).toBeCloseTo(0.030795104483096598 * 1e16)
    // 1600 至 1700
    expect(rulueDt(-137575.8) * 1e16).toBeCloseTo(0.0010481013723836036 * 1e16)
    // 1700 至 1800
    expect(rulueDt(-108870.5) * 1e16).toBeCloseTo(0.00011624566216088746 * 1e16)
    // 1800 至 1860
    expect(rulueDt(-68974.2) * 1e16).toBeCloseTo(0.00014494728320821082 * 1e16)
    // 1860 至 1900
    expect(rulueDt(-36830) * 1e16).toBeCloseTo(-0.000045332592842574625 * 1e16)
    // 1900 至 1920
    expect(rulueDt(-34517.3) * 1e16).toBeCloseTo(0.00005040955644932365 * 1e16)
    // 1920 至 1941
    expect(rulueDt(-24942) * 1e16).toBeCloseTo(0.0002780715279653992 * 1e16)
    // 1941 至 1961
    expect(rulueDt(-19861.9) * 1e16).toBeCloseTo(0.00031471777895112686 * 1e16)
    // 1961 至 1986
    expect(rulueDt(-11814.5) * 1e16).toBeCloseTo(0.00043892515363164436 * 1e16)
    // 1986 至 2005
    expect(rulueDt(-1429.3) * 1e16).toBeCloseTo(0.0007101739000836371 * 1e16)
    // 2005 至 2050
    expect(rulueDt(3162.2) * 1e16).toBeCloseTo(0.0007657768960069404 * 1e16)
    expect(rulueDt(7659.919094735647) * 1e16).toBeCloseTo(0.0009034201094998429 * 1e16)
    // 2050 至 2150
    expect(rulueDt(18628) * 1e16).toBeCloseTo(0.0014692185216060442 * 1e16)
    // 2150 以后
    expect(rulueDt(73047.5) * 1e16).toBeCloseTo(0.004949462378638071 * 1e16)
  })
})