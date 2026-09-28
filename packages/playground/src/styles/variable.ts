export default {
  light: {
    // 🪟 背景色 —— 与 Figma 对齐
    background: '255 255 255', // Bg Primary #FFFFFF
    background2: '250 250 250', // Bg Secondary #FAFAFA
    background3: '245 245 245', // Bg Tertiary #F5F5F5
    background4: '240 240 240', // Bg Quaternary #F0F0F0
    background5: '230 230 230', // Bg Quinary #E6E6E6

    // ✍️ 文字颜色 —— 分级控制（按设计稿更新）
    text: '0 0 0', // #000000
    text2: '0 0 0', // #000000 70% (通过 alpha 控制)
    text3: '0 0 0', // #000000 50% (通过 alpha 控制)
    text4: '0 0 0', // #000000 30% (通过 alpha 控制)
    textDisabled: '0 0 0', // #000000 10% (通过 alpha 控制)
    textSpecial: '255 255 255', // #FFFFFF (Special content)

    // 📏 边框 —— 按设计稿更新
    border: '235 235 235', // 对齐 Figma Border3(#000000 8%)的不透明等价色 ≈ #EBEBEB
    border2: '222 222 222', // Border Secondary #EBEBEB
    border3: '166 166 166',

    // 📜 滚动条 —— 轨道与滑块
    scrollbarTrack: 'transparent',
    scrollbarThumb: 'rgba(0, 0, 0, 0.1)',
    scrollbarThumbHover: 'rgba(0, 0, 0, 0.1)',

    /** 状态色（与 Figma 状态色对齐） */
    success: '52 199 89', // 状态 / 绿 #34c759
    successBg: '236 253 245',
    info: '65 156 255', // 状态 / 蓝 #419cff
    infoBg: '239 246 255',
    danger: '255 86 94', // 状态 / 红 #ff565e
    dangerBg: '254 242 242',
    warning: '250 193 65', // 状态 / 黄 #fac141
    warningBg: '254 243 199',

    /** 品牌与导航背景（来自 Figma 变量） */
    brand: '85 96 245', // #5560F5
    navBg: '255 255 255', // Figma 全局 / W Nav #ffffff

    /** 按钮颜色 */
    button: '0 0 0', // Button Primary #000000
    button2: '245 245 245', // Button Secondary #F5F5F5
    button3: '255 255 255', // Button Tertiary #FFFFFF

    /** 系统色（System 彩色） */
    systemRed: '255 86 94', // 红 #FF565E
    systemOrange: '255 151 74', // 橙 #FF974A
    systemYellow: '250 193 65', // 黄 #FAC141
    systemGreen: '52 199 89', // 绿 #34C759
    systemBlue: '65 156 255', // 蓝 #419CFF
    systemPurple: '233 56 246', // 紫 #E938F6

    /** 绿色调色 */
    toningGreenTextColor: '#059669',
    toningGreenBgColor: '#ECFDF5',
    toningGreenBorderColor: '#10B981',

    /** 蓝色调色 */
    toningBlueTextColor: '#2563EB',
    toningBlueBgColor: '#EFF6FF',
    toningBlueBorderColor: '#3B82F6',

    /** 紫色调色 */
    toningPurpleTextColor: '#9333EA',
    toningPurpleBgColor: '#FAF5FF',
    toningPurpleBorderColor: '#A855F7',

    /** 橙色调色 */
    toningOrangeTextColor: '#EA580C',
    toningOrangeBgColor: '#FFF7ED',
    toningOrangeBorderColor: '#F97316',

    /** 红色调色 */
    toningRedTextColor: '#DC2626',
    toningRedBgColor: '#FEF2F2',
    toningRedBorderColor: '#EF4444',

    /** 黄色调色 */
    toningYellowTextColor: '#D97706',
    toningYellowBgColor: '#FEF3C7',
    toningYellowBorderColor: '#F59E0B',

    /** 灰色调色 */
    toningGrayTextColor: '#6B7280',
    toningGrayBgColor: '#F3F4F6',
    toningGrayBorderColor: '#9CA3AF',

    /** 石板色调色 */
    toningSlateTextColor: '#374151',
    toningSlateBgColor: '#f3f4f6',
    toningSlateBorderColor: '#64748B',

    /** 骨架屏颜色 token（light） */
    skeletonBase: '245 246 248',
    skeletonHighlight: '233 236 239',

    /**
     * 🎨 SVG 图标颜色 —— 用于 SVG fill/stroke
     * svgFillPrimary: 用于 active 状态（反色设计：浅色模式下黑色背景+白色图标）
     * svgFillSecondary: 用于 inactive 状态（浅色模式下白色背景+浅灰色图标）
     * 对于单色 SVG，建议使用 currentColor 继承文字颜色
     */
    svgFillPrimary: '255 255 255', // 主要填充色（active 状态：反色设计，浅色模式下白色）
    svgFillSecondary: '0 0 0', // 次要填充色（inactive 状态：黑/白，通常配合 opacity 0.5 使用）
    svgStrokePrimary: '255 255 255', // 主要描边色（active 状态）
    svgStrokeSecondary: '0 0 0', // 次要描边色（inactive 状态：黑/白）
  },
  dark: {
    // 🪟 背景色 —— 以深灰为主，避免死黑
    background: '0 0 0',
    background2: '20 20 20',
    background3: '30 30 30',
    background4: '40 40 40',
    background5: '50 50 50',

    // ✍️ 文字颜色 —— 反转对比
    text: '249 250 251',
    text2: '156 163 175',
    text3: '156 163 175',
    text4: '107 114 128',
    textDisabled: '107 114 128',
    textSpecial: '0 0 0',

    // 📏 边框 —— 用于组件分界
    border: '38 38 38', // 对齐 Figma Border3(#FFFFFF 8%)叠深色卡的不透明等价色 ≈ #262626
    border2: '50 50 50',
    border3: '75 75 75',

    // 📜 滚动条 —— 轨道与滑块
    scrollbarTrack: 'transparent',
    scrollbarThumb: 'rgba(107, 114, 128, 0.1)',
    scrollbarThumbHover: 'rgba(107, 114, 128, 0.1)',

    /** 状态色（深色，与 Figma 状态色对齐） */
    success: '48 209 88', // #30D158
    successBg: '6 78 59',
    info: '65 156 255', // #419CFF
    infoBg: '30 58 138',
    danger: '255 86 94', // #FF565E
    dangerBg: '127 29 29',
    warning: '255 197 66', // #FFC542
    warningBg: '120 53 15',

    /** 品牌与导航背景（暗色占位，需根据 Figma 暗色稿再精调） */
    brand: '85 96 245', // #5560F5
    navBg: '0 0 0', // Figma 全局 / B Nav #000000

    /** 按钮颜色（需要根据设计稿调整） */
    button: '255 255 255',
    button2: '40 40 40',
    button3: '20 20 20',

    /** 系统色（System 彩色） */
    systemRed: '255 86 94', // 红 #FF565E
    systemOrange: '255 151 74', // 橙 #FF974A
    systemYellow: '255 197 66', // 黄 #FFC542
    systemGreen: '48 209 88', // 绿 #30D158
    systemBlue: '65 156 255', // 蓝 #419CFF
    systemPurple: '233 56 246', // 紫 #E938F6

    /** 绿色调色 */
    toningGreenTextColor: '#34D399',
    toningGreenBgColor: '#064E3B',
    toningGreenBorderColor: '#065F46',

    /** 蓝色调色 */
    toningBlueTextColor: '#60A5FA',
    toningBlueBgColor: '#1E3A8A',
    toningBlueBorderColor: '#2563EB',

    /** 紫色调色 */
    toningPurpleTextColor: '#A78BFA',
    toningPurpleBgColor: '#4C1D95',
    toningPurpleBorderColor: '#7E22CE',

    /** 橙色调色 */
    toningOrangeTextColor: '#FB923C',
    toningOrangeBgColor: '#7C2D12',
    toningOrangeBorderColor: '#C2410C',

    /** 红色调色 */
    toningRedTextColor: '#F87171',
    toningRedBgColor: '#7F1D1D',
    toningRedBorderColor: '#B91C1C',

    /** 黄色调色 */
    toningYellowTextColor: '#FBBF24',
    toningYellowBgColor: '#78350F',
    toningYellowBorderColor: '#B45309',

    /** 灰色调色 */
    toningGrayTextColor: '#9CA3AF',
    toningGrayBgColor: '#1F2937',
    toningGrayBorderColor: '#4B5563',

    /** 石板色调色 */
    toningSlateTextColor: '#E5E7EB',
    toningSlateBgColor: '#0F172A',
    toningSlateBorderColor: '#334155',

    /** 骨架屏颜色 token（dark） */
    skeletonBase: '28 28 30',
    skeletonHighlight: '50 50 60',

    /**
     * 🎨 SVG 图标颜色 —— 用于 SVG fill/stroke
     * svgFillPrimary: 用于 active 状态（反色设计：深色模式下白色背景+黑色图标）
     * svgFillSecondary: 用于 inactive 状态（深色模式下深色背景+浅灰色图标） 对应 text2
     * 对于单色 SVG，建议使用 currentColor 继承文字颜色
     */
    svgFillPrimary: '0 0 0', // 主要填充色（active 状态：反色设计，深色模式下黑色）
    svgFillSecondary: '249 250 251', // 次要填充色（inactive 状态：黑/白，对应 text）
    svgStrokePrimary: '0 0 0', // 主要描边色（active 状态）
    svgStrokeSecondary: '249 250 251', // 次要描边色（inactive 状态：黑/白）
  },
}
