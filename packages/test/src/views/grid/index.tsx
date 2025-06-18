import { Card } from '@/components/Card'

export default function GridTest() {
  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900 dark:to-gray-800 h-screen overflow-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          📐 网格效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Grid 网格组件测试页面 - 开发中
        </p>
      </div>

      <Card className="p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-xl font-semibold mb-2">功能开发中</h2>
          <p>Grid 网格效果组件正在开发中，敬请期待！</p>
        </div>
      </Card>
    </div>
  )
}
