/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-27 15:48:22
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-27 15:48:23
 * @Description: 
 */
import { estimateQishuo } from '@yhbagua/astro'

describe('气朔估算', () => {
  test('上古时期以及现代，使用天文算法估算', () => {
    // 首个平气表之前的时间
    expect(estimateQishuo(-1193847)).toBe(-1193851)
    expect(estimateQishuo(-1193847, false)).toBe(-1193858)
    // 2000 年
    expect(estimateQishuo(0)).toBe(5)
    expect(estimateQishuo(0, false)).toBe(6)
    // 未来3000年以后
    expect(estimateQishuo(3547272)).toBe(3547263)
    expect(estimateQishuo(3547272, false)).toBe(3547276)
  })

  test('使用平气平朔表的估算', () => {
    expect(estimateQishuo(-567905)).toBe(-567902)
    expect(estimateQishuo(-567905, false)).toBe(-567897)
  })

  test('使用定气定朔的估算', () => {
    expect(estimateQishuo(-129045)).toBe(-129045)
    expect(estimateQishuo(-129045, false)).toBe(-129044)
  })
})