import { defineConfig } from 'oxlint'

export default defineConfig({
  ignorePatterns: ['dist', 'public', 'node_modules', '**/*.json', '**/*.jsonc', '**/*.json5', '**/*.d.ts'],
  plugins: [],
  jsPlugins: ['@jl-org/eslint-plugins'],
  rules: {
    'no-unused-expressions': 'off',
    'react/exhaustive-deps': 'warn',
    'react/rules-of-hooks': 'error',
    '@jl-org/eslint-plugins/forceTernary': 'warn',
    // '@jl-org/eslint-plugins/docComment': [
    //   'warn',
    //   {
    //     /** 匹配文字字符开头，但跳过 lint、formatter、coverage 等工具指令 */
    //     pattern:
    //       '^(?!(?:(?:eslint|oxlint|stylelint)-(?:disable|enable)|(?:prettier|oxfmt|biome)-ignore|(?:istanbul|c8|v8) ignore)\\b)[A-Za-z0-9\\u00C0-\\u02AF\\u3040-\\u30FF\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uAC00-\\uD7AF]',
    //   },
    // ],
    '@jl-org/eslint-plugins/reactVIf': 'error',
  },
})
