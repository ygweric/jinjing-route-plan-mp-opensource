import  env from "./env.mjs";
import ci from "miniprogram-ci";
import * as fs from 'fs'

console.log(`env: ${JSON.stringify(env)}`)

/* 项目配置 */
const  projectConfig  = JSON.parse(fs.readFileSync('./project.config.json', 'utf-8')) 
const  packageConfig  = JSON.parse(fs.readFileSync('./package.json', 'utf-8')) 

// new ci实例
const project = new ci.Project({
  appid: projectConfig.appid,
  type: 'miniProgram',
  projectPath: './dist-prod', // projectConfig.miniprogramRoot,
  privateKeyPath: './ci-private.jinjing.key',
  ignores: [

  ]
})

/** 上传 */
async function upload () {
  const uploadResult = await ci.upload({
    project,
    version: packageConfig.version,
    desc: `Jenkins自动发布 at ${new Date()}`,
    setting: {
    },
    onProgressUpdate: console.log
  })

  console.log('>>>>>>> uploadResult: ', uploadResult)
}

/** 入口函数 */
setTimeout(async () => {
  try {
    // 上传
    await upload()
  } catch (error) {
    console.error('>>>>>>> error: ', error)
    process.exit(1)
  }
}, 0)
