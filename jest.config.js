/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-26 15:07:06
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-26 18:50:56
 * @Description: 单元测试配置文件
 */
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: "__coverage__",
  moduleNameMapper: {
    '^@yhbagua/(.*?)$': '<rootDir>/packages/$1/src',
  },
  globals: {
    'ts-jest': {
      // ts-jest额外配置
    }
  }
}