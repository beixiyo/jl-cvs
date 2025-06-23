import { CaseSensitive, Eye, EyeOff, FileText, Hash, Mail, RadioTower, Search, X } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '../ThemeToggle'
import { Input } from './Input'
import { NumberInput } from './NumberInput'
import { Radio, RadioGroup } from './Radio'
import { Textarea } from './Textarea/Textarea'

export default function App() {
  const [value1, setValue1] = useState('')
  const [value2, setValue2] = useState('')
  const [value3, setValue3] = useState('')
  const [value4, setValue4] = useState('')
  const [value5RichPaste, setValue5RichPaste] = useState('')
  const [value6Label, setValue6Label] = useState('初始内容\n带换行')
  const [inputValue1, setInputValue1] = useState('')
  const [inputValue2, setInputValue2] = useState('')
  const [inputValue3, setInputValue3] = useState('')
  const [numberValue1, setNumberValue1] = useState(0)
  const [numberValue2, setNumberValue2] = useState(5)
  const [radioValue, setRadioValue] = useState('option1')
  const [radioValue2, setRadioValue2] = useState('B')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900 sm:p-8">
      <div className="absolute right-8 top-8">
        <ThemeToggle />
      </div>
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-12 text-center text-4xl text-slate-900 font-extrabold tracking-tight dark:text-slate-50">
          组件库演示
        </h1>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* ----- Input & NumberInput Column ----- */}
          <div className="space-y-8">
            {/* Input组件测试 */}
            <div className="flex items-center gap-4">
              <CaseSensitive className="h-10 w-10 text-blue-500" />
              <h1 className="text-3xl text-slate-800 font-bold dark:text-slate-100">Input 组件</h1>
            </div>

            {/* 基础用法 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">基础用法</h2>
              <Input
                id="basic-input"
                placeholder="请输入内容..."
                value={ inputValue1 }
                onChange={ setInputValue1 }
                label="基础输入框"
              />
            </section>

            {/* 不同大小 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">不同大小</h2>
              <div className="space-y-4">
                <Input id="size-sm" placeholder="小尺寸" size="sm" label="小尺寸" />
                <Input id="size-md" placeholder="中等尺寸（默认）" size="md" label="中尺寸" />
                <Input id="size-lg" placeholder="大尺寸" size="lg" label="大尺寸" />
              </div>
            </section>

            {/* 禁用与只读 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">禁用与只读</h2>
              <div className="space-y-4">
                <Input
                  id="disabled-input"
                  label="禁用状态"
                  placeholder="禁用状态"
                  disabled
                  value="这是禁用状态的输入框"
                />
                <Input
                  id="readonly-input"
                  label="只读状态"
                  placeholder="只读状态"
                  readOnly
                  value="这是只读状态的输入框"
                />
              </div>
            </section>

            {/* 错误状态 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">错误状态</h2>
              <Input
                id="error-input"
                label="错误状态演示"
                placeholder="请输入内容..."
                error
                errorMessage="输入内容不能为空，这是一个错误提示。"
                required
              />
            </section>

            {/* 前缀和后缀 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">前缀和后缀</h2>
              <div className="space-y-4">
                <Input
                  id="prefix-input"
                  label="带前缀图标"
                  placeholder="搜索内容..."
                  prefix={ <Search size={ 18 } /> }
                  value={ inputValue2 }
                  onChange={ setInputValue2 }
                  suffix={ inputValue2
                    ? <X size={ 18 } className="cursor-pointer hover:text-slate-600" onClick={ () => setInputValue2('') } />
                    : null }
                />
                <Input
                  id="suffix-input"
                  label="带后缀图标"
                  placeholder="请输入邮箱..."
                  suffix={ <Mail size={ 18 } /> }
                />
                <Input
                  id="password-input"
                  label="密码输入框"
                  type={ showPassword
                    ? 'text'
                    : 'password' }
                  placeholder="请输入密码..."
                  suffix={
                    <div
                      className="cursor-pointer hover:text-slate-600"
                      onClick={ () => setShowPassword(!showPassword) }
                    >
                      {showPassword
                        ? <EyeOff size={ 18 } />
                        : <Eye size={ 18 } />}
                    </div>
                  }
                  value={ inputValue3 }
                  onChange={ setInputValue3 }
                />
              </div>
            </section>

            {/* 标签位置 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">标签位置</h2>
              <div className="space-y-4">
                <Input
                  id="top-label"
                  label="标签在顶部（默认）"
                  placeholder="请输入内容..."
                  labelPosition="top"
                />
                <Input
                  id="left-label"
                  label="标签在左侧"
                  placeholder="请输入内容..."
                  labelPosition="left"
                />
              </div>
            </section>

            {/* 数字输入框 */}
            <div className="flex items-center gap-4 pt-8">
              <Hash className="h-10 w-10 text-green-500" />
              <h1 className="text-3xl text-slate-800 font-bold dark:text-slate-100">NumberInput</h1>
            </div>
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">数字输入框</h2>
              <div className="space-y-4">
                <NumberInput
                  id="number-input"
                  label="基础数字输入框"
                  placeholder="请输入数字..."
                  value={ numberValue1 }
                  onChange={ setNumberValue1 }
                />
                <NumberInput
                  id="number-input-min-max"
                  label="带范围限制的数字输入框"
                  placeholder="请输入数字..."
                  min={ 0 }
                  max={ 10 }
                  step={ 1 }
                  value={ numberValue2 }
                  onChange={ setNumberValue2 }
                />
                <NumberInput
                  id="number-input-precision"
                  label="小数精度控制"
                  placeholder="请输入数字..."
                  step={ 0.1 }
                  precision={ 2 }
                />
                <NumberInput
                  id="number-input-disabled"
                  label="禁用状态"
                  placeholder="禁用状态"
                  disabled
                  value="5"
                />
              </div>
            </section>
          </div>

          {/* ----- Textarea & Radio Column ----- */}
          <div className="space-y-8">
            {/* Textarea 组件演示 */}
            <div className="flex items-center gap-4">
              <FileText className="h-10 w-10 text-purple-500" />
              <h1 className="text-3xl text-slate-800 font-bold dark:text-slate-100">Textarea 组件</h1>
            </div>

            {/* 基础用法 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">基础用法</h2>
              <Textarea
                id="basic"
                placeholder="请输入内容..."
                value={ value1 }
                onChange={ setValue1 }
                label="基础输入框"
              />
            </section>

            {/* 不同大小 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">不同大小</h2>
              <div className="space-y-4">
                <Textarea id="size-sm" placeholder="小尺寸" size="sm" label="小尺寸" />
                <Textarea id="size-md" placeholder="中等尺寸（默认）" size="md" label="中尺寸" />
                <Textarea id="size-lg" placeholder="大尺寸" size="lg" label="大尺寸" />
              </div>
            </section>

            {/* 字数限制与计数 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">字数限制与计数</h2>
              <div className="space-y-6">
                <Textarea
                  id="counter"
                  label="带计数器"
                  value={ value2 }
                  onChange={ setValue2 }
                  maxLength={ 100 }
                  showCount
                />
                <Textarea
                  id="counter-format"
                  label="自定义计数格式"
                  value={ value3 }
                  onChange={ setValue3 }
                  maxLength={ 50 }
                  showCount
                  counterPosition="left"
                  counterFormat={ (current, max) =>
                    `已输入 ${current} 字${max
                      ? `，还可输入 ${max - current} 字`
                      : ''}` }
                />
              </div>
            </section>

            {/* 错误状态 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">错误状态</h2>
              <Textarea
                id="error"
                label="错误状态演示"
                placeholder="请输入内容..."
                error
                errorMessage="输入内容不能为空，这是一个错误提示。"
                required
              />
            </section>

            {/* 自动高度调整 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">自动高度调整</h2>
              <Textarea
                id="auto-resize"
                label="自动调整高度"
                placeholder="输入更多内容查看高度自动调整..."
                value={ value4 }
                onChange={ setValue4 }
                autoResize
                rows={ 2 }
              />
            </section>

            {/* Radio 组件演示 */}
            <div className="flex items-center gap-4 pt-8">
              <RadioTower className="h-10 w-10 text-red-500" />
              <h1 className="text-3xl text-slate-800 font-bold dark:text-slate-100">Radio 组件</h1>
            </div>

            {/* 基础用法 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">基础用法</h2>
              <RadioGroup name="basic-radio" value={ radioValue } onChange={ setRadioValue }>
                <Radio value="option1" label="选项一" />
                <Radio value="option2" label="选项二" />
                <Radio value="option3" label="选项三" />
              </RadioGroup>
              <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                当前选中:
                {' '}
                <span className="text-blue-600 font-semibold dark:text-blue-400">{radioValue}</span>
              </div>
            </section>

            {/* 不同大小 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">不同大小</h2>
              <div className="flex items-center space-x-6">
                <RadioGroup name="size-radio" value={ radioValue } direction="horizontal" onChange={ setRadioValue }>
                  <Radio value="option1" label="小尺寸" size="sm" />
                  <Radio value="option2" label="中尺寸" size="md" />
                  <Radio value="option3" label="大尺寸" size="lg" />
                </RadioGroup>
              </div>
            </section>

            {/* 水平布局和禁用 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">水平布局和禁用</h2>
              <RadioGroup name="disabled-radio" direction="horizontal" value={ radioValue2 } onChange={ setRadioValue2 }>
                <Radio value="A" label="选项 A" />
                <Radio value="B" label="选项 B" />
                <Radio value="C" label="选项 C (禁用)" disabled />
              </RadioGroup>
            </section>

            {/* 错误状态 */}
            <section className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
              <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">错误状态</h2>
              <RadioGroup name="error-radio" value="option1">
                <Radio value="option1" label="选项一" error errorMessage="这是一个错误提示" required checked />
                <Radio value="option2" label="选项二 (也有错误)" error />
              </RadioGroup>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
