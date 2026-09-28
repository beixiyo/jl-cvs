import { Card } from '@/components/Card/Card'
import { Wand2 } from 'lucide-react'
import { segsData } from './data'
import { SmartSelection } from './SmartSelection'

/**
 * 智能选取展示页面
 * 展示了基于图像分割的智能选取功能
 */
export default function Test() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col px-5 py-7 lg:px-8 lg:py-9">
      <header className="mb-6">
        <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight lg:text-2xl">
          <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-background2 text-brand">
            <Wand2 size={ 16 } />
          </span>
          智能选区
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-text2">
          基于图像分割的主体识别：点击高亮区块或框选区域，快速得到精确蒙版
        </p>
      </header>

      <Card className="w-full max-w-3xl self-center overflow-hidden rounded-2xl">
        <div className="relative bg-slate-800 p-4 dark:bg-slate-900">
          <SmartSelection
            imgUrl={ segsData.originalImage }
            maskData={ segsData.masksBase64 }
            className="overflow-hidden rounded-lg"
            style={ {
              width: '100%',
              height: '500px',
            } }
          />
        </div>

        <div className="bg-slate-50 p-4 text-center text-sm text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          将鼠标悬停在图像上，点击选择或取消选择区域 ✨
        </div>
      </Card>
    </div>
  )
}
