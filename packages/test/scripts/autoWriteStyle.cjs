const { resolve } = require('node:path')
const { writeStyle } = require('@jl-org/js-to-style')

writeStyle({
  jsPath: resolve(__dirname, '../src/styles/variable.ts'),
  cssPath: resolve(__dirname, '../src/styles/css/autoVariables.css'),
})
