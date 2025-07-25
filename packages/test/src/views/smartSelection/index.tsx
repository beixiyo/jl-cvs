import { Wand2 } from 'lucide-react'
import { memo } from 'react'
import { Card } from '@/components/Card/Card'
import { segsData } from './data'
import { SmartSelection } from './SmartSelection'

/**
 * 智能选取展示页面
 * 展示了基于图像分割的智能选取功能
 */
export default function Test() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center from-slate-100 to-slate-200 bg-gradient-to-br p-6 dark:from-slate-800 dark:to-slate-900">
      <Card className="max-w-3xl w-full overflow-hidden rounded-xl shadow-xl dark:shadow-slate-800/30">
        <div className="mb-3 flex items-center justify-between">
          <div className="w-full flex items-center items-center justify-center gap-3">
            <Wand2 className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl text-slate-800 font-bold dark:text-slate-100">智能选取演示</h2>
          </div>
        </div>

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

/**
 * 操作指南项
 */
const InstructionItem = memo(({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:bg-slate-700/50 dark:text-slate-300">
    { icon }
    <span>{ text }</span>
  </div>
))

InstructionItem.displayName = 'InstructionItem'
