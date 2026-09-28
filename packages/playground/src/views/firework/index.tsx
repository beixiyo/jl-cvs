import { Button } from '@/components/Button'
import { NumberInput } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { useGetState } from '@/hooks'
import { useLatestCallback } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { createFirework, createFirework2 } from '@jl-org/cvs'
import { Flame } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type FireworkType = 'classic' | 'burst'

export default function FireworkTest() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [fireworkType, setFireworkType] = useGetState<FireworkType, true>('burst', true)
  const [config, setConfig] = useState({
    width: 800,
    height: 600,
    yRange: 50,
    speed: 2.5,
    r: 6,
    ballCount: 150,
    gapTime: 500,
    maxCount: 2,
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stopFireworkRef = useRef<(() => void) | null>(null)
  const firework2InstanceRef = useRef<
    {
      addFirework: () => void
      stop: () => void
      resume: () => void
    } | null
  >(null)
  const firework2IntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /** 颜色预设 */
  const colorPresets = useMemo(() => [
    {
      name: '经典暖色',
      getFireworkColor: (opacity: number) => `rgba(210, 250, 90, ${opacity})`,
      getBoomColor: () => {
        const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF4500']
        return colors[Math.floor(Math.random() * colors.length)]
      },
    },
    {
      name: '静谧蓝',
      getFireworkColor: (opacity: number) => `rgba(100, 200, 255, ${opacity})`,
      getBoomColor: () => {
        const colors = ['#00BFFF', '#1E90FF', '#4169E1', '#0000FF']
        return colors[Math.floor(Math.random() * colors.length)]
      },
    },
    {
      name: '彩虹',
      getFireworkColor: (opacity: number) => `rgba(255, 255, 255, ${opacity})`,
      getBoomColor: () => {
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']
        return colors[Math.floor(Math.random() * colors.length)]
      },
    },
    {
      name: '浪漫粉',
      getFireworkColor: (opacity: number) => `rgba(255, 192, 203, ${opacity})`,
      getBoomColor: () => {
        const colors = ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FF1493']
        return colors[Math.floor(Math.random() * colors.length)]
      },
    },
  ], [])

  const [selectedColorPreset, setSelectedColorPreset] = useState(0)

  /** 停止烟花 */
  const stopFirework = useCallback(() => {
    if (stopFireworkRef.current) {
      stopFireworkRef.current()
      stopFireworkRef.current = null
    }

    if (firework2InstanceRef.current) {
      firework2InstanceRef.current.stop()
      firework2InstanceRef.current = null
    }

    if (firework2IntervalRef.current) {
      clearInterval(firework2IntervalRef.current)
      firework2IntervalRef.current = null
    }

    setIsPlaying(false)
  }, [])

  /** 开始烟花；useLatestCallback 保证引用恒定且内部始终读最新 config / 颜色预设，
   *  延时重启时不会用过期闭包，也不会因引用变化触发 effect 重启 */
  const startFirework = useLatestCallback(() => {
    if (!canvasRef.current) return

    stopFirework()

    if (setFireworkType.getLatest() === 'classic') {
      /** 经典烟花 */
      const currentColorPreset = colorPresets[selectedColorPreset]
      stopFireworkRef.current = createFirework(canvasRef.current, {
        ...config,
        getFireworkColor: currentColorPreset.getFireworkColor,
        getBoomColor: currentColorPreset.getBoomColor,
        speed: config.speed + 12,
      })
    }
    else {
      /** 二段爆炸烟花 */
      const ctx = canvasRef.current.getContext('2d')!
      const instance = createFirework2(canvasRef.current, {
        ctx,
        width: config.width,
        height: config.height,
      })

      firework2InstanceRef.current = instance
      firework2IntervalRef.current = setInterval(() => {
        instance.addFirework()
      }, config.gapTime)
      instance.addFirework()
    }

    setIsPlaying(true)
  })

  /** 更新配置 */
  const updateConfig = (key: keyof typeof config, value: number) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    if (isPlaying) {
      stopFirework()
      setTimeout(startFirework, 100)
    }
  }

  /** 切换颜色预设 */
  const changeColorPreset = (index: number) => {
    setSelectedColorPreset(index)
    if (isPlaying) {
      stopFirework()
      setTimeout(startFirework, 100)
    }
  }

  /** 切换烟花类型 */
  const changeFireworkType = (type: FireworkType) => {
    setFireworkType(type)
    if (isPlaying) {
      stopFirework()
      setTimeout(startFirework, 20)
    }
  }

  /** 进入页面自动播放，卸载时停止 */
  useEffect(() => {
    const timer = setTimeout(startFirework, 100)

    return () => {
      clearTimeout(timer)
      stopFirework()
    }
  }, [startFirework, stopFirework])

  return (
    <DemoPage
      title="烟花"
      desc="经典升空爆炸与二段连锁爆炸两种物理模拟，进入页面自动燃放"
      icon={ Flame }
    >
      <Stage>
        <canvas
          ref={ canvasRef }
          className="max-h-[68svh] max-w-full rounded-lg bg-black"
        />
      </Stage>

      <ConfigPanel>
        <ConfigGroup title="播放控制">
          <Button
            block
            rounded="lg"
            variant={ isPlaying
              ? 'danger'
              : 'success' }
            onClick={ isPlaying
              ? stopFirework
              : startFirework }
          >
            { isPlaying
              ? '停止燃放'
              : '开始燃放' }
          </Button>
        </ConfigGroup>

        <ConfigGroup title="烟花类型">
          <div className="flex gap-2">
            <Button
              size="sm"
              rounded="lg"
              variant={ fireworkType === 'classic'
                ? 'primary'
                : 'secondary' }
              onClick={ () => changeFireworkType('classic') }
            >
              经典升空
            </Button>
            <Button
              size="sm"
              rounded="lg"
              variant={ fireworkType === 'burst'
                ? 'primary'
                : 'secondary' }
              onClick={ () => changeFireworkType('burst') }
            >
              二段爆炸
            </Button>
          </div>
        </ConfigGroup>

        { fireworkType === 'classic' && (
          <ConfigGroup title="颜色主题">
            <div className="flex flex-wrap gap-2">
              { colorPresets.map((preset, index) => (
                <Button
                  key={ preset.name }
                  size="sm"
                  rounded="lg"
                  variant={ selectedColorPreset === index
                    ? 'primary'
                    : 'secondary' }
                  onClick={ () => changeColorPreset(index) }
                >
                  { preset.name }
                </Button>
              )) }
            </div>
          </ConfigGroup>
        ) }

        <ConfigGroup
          title={ fireworkType === 'burst'
            ? '参数（二段爆炸仅支持部分）'
            : '参数配置' }
        >
          <Field label="画布宽度" value={ config.width }>
            <NumberInput
              value={ config.width }
              onChange={ (v) => updateConfig('width', v) }
              min={ 400 }
              max={ 1200 }
            />
          </Field>

          <Field label="画布高度" value={ config.height }>
            <NumberInput
              value={ config.height }
              onChange={ (v) => updateConfig('height', v) }
              min={ 300 }
              max={ 800 }
            />
          </Field>

          { fireworkType === 'classic' && (
            <>
              <Field label="发射范围" value={ config.yRange }>
                <Slider
                  value={ config.yRange }
                  onChange={ (v) => updateConfig('yRange', v) }
                  min={ 20 }
                  max={ 200 }
                />
              </Field>

              <Field label="运动速度" value={ config.speed }>
                <Slider
                  value={ config.speed }
                  onChange={ (v) => updateConfig('speed', v) }
                  min={ 0.5 }
                  max={ 10 }
                  step={ 0.5 }
                />
              </Field>

              <Field label="小球半径" value={ config.r }>
                <Slider
                  value={ config.r }
                  onChange={ (v) => updateConfig('r', v) }
                  min={ 2 }
                  max={ 20 }
                />
              </Field>

              <Field label="小球数量" value={ config.ballCount }>
                <Slider
                  value={ config.ballCount }
                  onChange={ (v) => updateConfig('ballCount', v) }
                  min={ 50 }
                  max={ 500 }
                />
              </Field>

              <Field label="最大数量" value={ config.maxCount }>
                <Slider
                  value={ config.maxCount }
                  onChange={ (v) => updateConfig('maxCount', v) }
                  min={ 1 }
                  max={ 10 }
                />
              </Field>
            </>
          ) }

          <Field
            label="发射间隔 (ms)"
            value={ config.gapTime }
            hint={ fireworkType === 'burst'
              ? '二段爆炸的连发间隔'
              : undefined }
          >
            <NumberInput
              value={ config.gapTime }
              onChange={ (v) => updateConfig('gapTime', v) }
              min={ 100 }
              max={ 2000 }
            />
          </Field>
        </ConfigGroup>
      </ConfigPanel>
    </DemoPage>
  )
}
