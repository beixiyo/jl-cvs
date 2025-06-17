import { borderRadius, innerBg, lightTextColor, padding, primaryColor } from '@/styles/variable'
// import type { ThemeConfig } from 'antd'

type ThemeConfig = any

const FormCompHeight = 36

/**
 * @deprecated 不再使用 antd 组件
 */
export const AntdTheme: ThemeConfig = {
  components: {
    Button: {
      boxShadow: 'none',
      boxShadowSecondary: 'none',
      boxShadowTertiary: 'none',
      dangerShadow: 'none',
      defaultShadow: 'none',
      primaryShadow: 'none',
    },

    Menu: {
      itemHoverBg: innerBg,
      itemSelectedBg: innerBg,
      itemActiveBg: innerBg,
    },

    Modal: {
      borderRadius,
      borderRadiusLG: borderRadius,
      borderRadiusSM: borderRadius,
      borderRadiusXS: borderRadius,
      borderRadiusOuter: borderRadius,
    },

    /**
     * ==================================================
     * Forms
     */
    Select: {
      colorTextPlaceholder: lightTextColor,
      colorBorder: innerBg,
      colorBgBase: innerBg,
      colorBgBlur: innerBg,
      colorBgContainer: innerBg,
      controlHeight: FormCompHeight,

      optionSelectedColor: '#fff',
      optionSelectedBg: '#292F3799',
    },

    Cascader: {
      padding: padding / 2,
      paddingContentHorizontal: padding / 2,
      paddingContentVertical: padding / 2,
      paddingContentHorizontalLG: padding / 2,
      paddingContentVerticalLG: padding / 2,
      paddingContentHorizontalSM: padding / 2,
      paddingContentVerticalSM: padding / 2,
      paddingLG: padding / 2,
      paddingSM: padding / 2,
      paddingMD: padding / 2,
      paddingXL: padding / 2,
      paddingXS: padding / 2,
      paddingXXS: padding / 2,
      controlHeight: FormCompHeight,
    },

    Input: {
      colorTextPlaceholder: lightTextColor,
      activeBg: innerBg,
      colorBorder: innerBg,
      addonBg: innerBg,
      colorBgBase: innerBg,
      colorBgBlur: innerBg,
      colorBgContainer: innerBg,
      controlHeight: FormCompHeight,
    },
    InputNumber: {
      colorTextPlaceholder: lightTextColor,
      activeBg: innerBg,
      colorBorder: innerBg,
      addonBg: innerBg,
      colorBgBase: innerBg,
      colorBgBlur: innerBg,
      colorBgContainer: innerBg,
      controlHeight: FormCompHeight,
    },
    /**
     * Forms
     * ==================================================
     */

    Upload: {
      padding: 0,
    },

    Tabs: {
      itemColor: lightTextColor,
    },

    Segmented: {
      itemColor: lightTextColor,
      itemSelectedBg: primaryColor,
      itemSelectedColor: '#fff',
      itemActiveBg: primaryColor,
    },
  },
  token: {
    colorPrimary: primaryColor,

    borderRadius,
    borderRadiusLG: borderRadius,
    borderRadiusSM: borderRadius,
    borderRadiusXS: borderRadius,
    borderRadiusOuter: borderRadius,

    padding,
    paddingContentHorizontal: padding,
    paddingContentVertical: padding,
    paddingContentHorizontalLG: padding,
    paddingContentVerticalLG: padding,
    paddingContentHorizontalSM: padding,
    paddingContentVerticalSM: padding,
    paddingLG: padding,
    paddingSM: padding,
    paddingMD: padding,
    paddingXL: padding,
    paddingXS: padding,
    paddingXXS: padding,

  },
}
