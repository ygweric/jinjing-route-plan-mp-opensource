import * as fs from 'fs'
// node setEnvMJS.mjs prod

const args = process.argv.slice(2);

const [server, mode] = args

const envString = `const common = {
    server: '${server}', // local|test|prod
    mode: '${mode}', // dev|prod
  }
  export default common
  `

fs.writeFileSync('./env.mjs', envString)
