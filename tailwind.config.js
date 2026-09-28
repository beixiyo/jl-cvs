/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      /** 颜色 */
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        background2: 'rgb(var(--background2) / <alpha-value>)',
        background3: 'rgb(var(--background3) / <alpha-value>)',
        background4: 'rgb(var(--background4) / <alpha-value>)',
        background5: 'rgb(var(--background5) / <alpha-value>)',

        text: 'rgb(var(--text) / <alpha-value>)',
        text2: 'rgb(var(--text2) / 0.7)', // 70% 透明度，语义化使用
        text3: 'rgb(var(--text3) / 0.5)', // 50% 透明度，语义化使用
        text4: 'rgb(var(--text4) / 0.3)', // 30% 透明度，语义化使用
        textDisabled: 'rgb(var(--textDisabled) / 0.1)', // 10% 透明度，语义化使用
        textSpecial: 'rgb(var(--textSpecial) / <alpha-value>)',
        iconColor: 'rgb(var(--text4) / 0.5)',

        border: 'rgb(var(--border) / <alpha-value>)',
        border2: 'rgb(var(--border2) / <alpha-value>)',
        border3: 'rgb(var(--border3) / <alpha-value>)',

        success: 'rgb(var(--success) / <alpha-value>)',
        successBg: 'rgb(var(--successBg) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
        infoBg: 'rgb(var(--infoBg) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        dangerBg: 'rgb(var(--dangerBg) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        warningBg: 'rgb(var(--warningBg) / <alpha-value>)',

        brand: 'rgb(var(--brand) / <alpha-value>)',
        navBg: 'rgb(var(--navBg) / <alpha-value>)',

        /** 按钮颜色 */
        button: 'rgb(var(--button) / <alpha-value>)',
        button2: 'rgb(var(--button2) / <alpha-value>)',
        button3: 'rgb(var(--button3) / <alpha-value>)',

        /** 系统色（System 彩色） */
        systemRed: 'rgb(var(--systemRed) / <alpha-value>)',
        systemOrange: 'rgb(var(--systemOrange) / <alpha-value>)',
        systemYellow: 'rgb(var(--systemYellow) / <alpha-value>)',
        systemGreen: 'rgb(var(--systemGreen) / <alpha-value>)',
        systemBlue: 'rgb(var(--systemBlue) / <alpha-value>)',
        systemPurple: 'rgb(var(--systemPurple) / <alpha-value>)',

        /** 骨架屏颜色（用于直接在 Tailwind 中使用） */
        skeletonBase: 'rgb(var(--skeleton-base) / <alpha-value>)',
        skeletonHighlight: 'rgb(var(--skeleton-highlight) / <alpha-value>)',
      },

      /** 动画 */
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-3px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(4px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-6px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(6px, 0, 0)' },
        },
      },
      animation: {
        shake: 'shake .4s cubic-bezier(0.28, -0.44, 0.55, 1.55) 2 both',
      },
      /** z-index 语义分层 */
      zIndex: {
        hide: '-1',
        docked: '10',
        dropdown: '1000',
        sticky: '1100',
        overlay: '1300',
        modal: '1400',
        popover: '1500',
        toast: '1700',
        tooltip: '1800',
      },

      /** 阴影预设（基于变量） */
      boxShadow: {
        card: '0px 8px 48px 0px rgb(0 0 0 / 0.15)',
        button: '0px 4px 20px 0px rgb(0 0 0 / 0.1)',
        toast: '0px 8px 20px 0px rgb(0 0 0 / 0.1)',
      },
      dropShadow: {
        card: '0px 8px 48px rgb(0 0 0 / 0.15)',
      },
    },
  },

  plugins: [
    /** 自定义工具类 */
    function({ addUtilities, addComponents }) {
      /** 隐藏滚动条 */
      addUtilities({
        /** 为滚动条预留宽度，避免内容变化时布局变形 */
        '.scrollbar-gutter-stable': {
          'scrollbar-gutter': 'stable',
        },
        '.hide-scroll': {
          /* Firefox - 保持滚动条占用空间，但颜色透明 */
          'scrollbar-width': 'thin',
          'scrollbar-color': 'transparent transparent',
          /* IE & Edge */
          '-ms-overflow-style': 'auto',
          /* Safari & Chrome - 保持滚动条占用空间，但颜色透明 */
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            'background-color': 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            'background-color': 'transparent',
            'border-radius': '6px',
            border: '2px solid transparent',
            'background-clip': 'padding-box',
          },
          /* 鼠标悬停或聚焦时显示滚动条颜色 */
          '&:hover': {
            'scrollbar-color': 'var(--scrollbarThumb) transparent',
            '&::-webkit-scrollbar-thumb': {
              'background-color': 'var(--scrollbarThumb)',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              'background-color': 'var(--scrollbarThumbHover)',
            },
          },
          '&:focus-within': {
            'scrollbar-color': 'var(--scrollbarThumb) transparent',
            '&::-webkit-scrollbar-thumb': {
              'background-color': 'var(--scrollbarThumb)',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              'background-color': 'var(--scrollbarThumbHover)',
            },
          },
        },
      })

      /** 居中工具 */
      addComponents({
        '.center-x': {
          left: '50%',
          transform: 'translateX(-50%)',
        },
        '.center-y': {
          top: '50%',
          transform: 'translateY(-50%)',
        },
        '.center': {
          '@apply center-x center-y': {},
        },
      })

      /** 调色快捷类 (text + bg + border) */
      const toning = [
        'green',
        'blue',
        'purple',
        'orange',
        'red',
        'yellow',
        'gray',
        'slate',
      ]
      const toningComponents = {}
      toning.forEach((color) => {
        const colorName = color.charAt(0).toUpperCase() + color.slice(1)
        toningComponents[`.toning-${color}`] = {
          color: `var(--toning${colorName}TextColor)`,
          backgroundColor: `var(--toning${colorName}BgColor)`,
          borderColor: `var(--toning${colorName}BorderColor)`,
          borderWidth: '1px',
          borderStyle: 'solid',
        }
        toningComponents[`.toning-${color}-text`] = {
          color: `var(--toning${colorName}TextColor)`,
        }
        toningComponents[`.toning-${color}-border`] = {
          borderColor: `var(--toning${colorName}BorderColor)`,
          borderWidth: '1px',
          borderStyle: 'solid',
        }
      })
      addComponents(toningComponents)
    },
  ],
}
