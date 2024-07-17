import * as fs from 'fs'

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
const oldVersion = packageJson.version
const oldVersionArr = oldVersion.split('.')
const lastVersionIndex = oldVersionArr.length - 1
oldVersionArr[lastVersionIndex] = `${parseInt(oldVersionArr[lastVersionIndex], 10) + 1}`
const newVersion = oldVersionArr.join('.')
packageJson.version = newVersion
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2))
const versionStr = `const common = { version: '${newVersion}' }; export default common;`
fs.writeFileSync('./version.js', versionStr)
