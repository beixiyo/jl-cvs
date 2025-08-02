export function FeatureSection() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="backdrop-blur-lg bg-white/60 border border-white/20 rounded-2xl p-8 shadow-xl dark:bg-gray-800/60 dark:border-gray-700/30">
        <div className="text-center mb-8">
          <h2 className="text-2xl text-gray-800 font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent dark:from-gray-200 dark:to-gray-400">
            功能说明
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 gap-8 text-gray-600 lg:grid-cols-2 dark:text-gray-300">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              绘图模式
            </h3>
            <div className="space-y-3 pl-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-gray-800 dark:text-white">绘制：</strong>
                  <span className="ml-1">自由绘制线条</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-gray-800 dark:text-white">擦除：</strong>
                  <span className="ml-1">擦除已绘制内容</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-gray-800 dark:text-white">拖拽：</strong>
                  <span className="ml-1">右键拖拽移动画布</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-gray-800 dark:text-white">图形：</strong>
                  <span className="ml-1">绘制矩形、圆形、箭头</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              快捷操作
            </h3>
            <div className="space-y-3 pl-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-gray-800 dark:text-white">撤销/重做：</strong>
                  <span className="ml-1">支持多步操作历史 (Ctrl+Z / Ctrl+Shift+Z)</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-gray-800 dark:text-white">快捷键：</strong>
                  <span className="ml-1">支持键盘快捷键操作，点击右下角快捷键按钮查看</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-gray-800 dark:text-white">导出：</strong>
                  <span className="ml-1">保存为 PNG 图片 (Ctrl+E)</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-gray-800 dark:text-white">缩放：</strong>
                  <span className="ml-1">鼠标滚轮缩放画布</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
