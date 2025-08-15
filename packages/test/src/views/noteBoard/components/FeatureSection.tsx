export function FeatureSection() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="border border-white/20 rounded-2xl bg-white/60 p-8 shadow-xl backdrop-blur-lg dark:border-gray-700/30 dark:bg-gray-800/60">
        <div className="mb-8 text-center">
          <h2 className="from-gray-700 to-gray-900 bg-gradient-to-r bg-clip-text text-2xl text-gray-800 text-transparent font-bold dark:from-gray-200 dark:to-gray-400">
            功能说明
          </h2>
          <div className="mx-auto mt-3 h-1 w-24 rounded-full from-blue-500 to-purple-600 bg-gradient-to-r" />
        </div>

        <div className="grid grid-cols-1 gap-8 text-gray-600 lg:grid-cols-3 dark:text-gray-300">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg text-gray-800 font-semibold dark:text-white">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              绘图模式
            </h3>
            <div className="pl-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <div>
                  <strong className="text-gray-800 dark:text-white">绘制：</strong>
                  <span className="ml-1">自由绘制线条</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <div>
                  <strong className="text-gray-800 dark:text-white">擦除：</strong>
                  <span className="ml-1">擦除已绘制内容</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <div>
                  <strong className="text-gray-800 dark:text-white">拖拽：</strong>
                  <span className="ml-1">右键拖拽移动画布</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <div>
                  <strong className="text-gray-800 dark:text-white">图形：</strong>
                  <span className="ml-1">绘制矩形、圆形、箭头</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg text-gray-800 font-semibold dark:text-white">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              快捷操作
            </h3>
            <div className="pl-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <div>
                  <strong className="text-gray-800 dark:text-white">撤销/重做：</strong>
                  <span className="ml-1">支持多步操作历史 (Ctrl+Z / Ctrl+Shift+Z)</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <div>
                  <strong className="text-gray-800 dark:text-white">快捷键：</strong>
                  <span className="ml-1">支持键盘快捷键操作，点击右下角快捷键按钮查看</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <div>
                  <strong className="text-gray-800 dark:text-white">导出：</strong>
                  <span className="ml-1">保存为 PNG 图片 (Ctrl+E)</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <div>
                  <strong className="text-gray-800 dark:text-white">缩放：</strong>
                  <span className="ml-1">鼠标滚轮缩放画布</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg text-gray-800 font-semibold dark:text-white">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              API 测试
            </h3>
            <div className="pl-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <div>
                  <strong className="text-gray-800 dark:text-white">addShape：</strong>
                  <span className="ml-1">编程方式添加形状到画板</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <div>
                  <strong className="text-gray-800 dark:text-white">坐标控制：</strong>
                  <span className="ml-1">精确设置形状位置和大小</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <div>
                  <strong className="text-gray-800 dark:text-white">样式定制：</strong>
                  <span className="ml-1">自定义颜色、线宽、填充</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <div>
                  <strong className="text-gray-800 dark:text-white">随机测试：</strong>
                  <span className="ml-1">一键生成随机形状进行测试</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
