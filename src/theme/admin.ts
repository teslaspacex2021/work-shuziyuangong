/** 管理后台视觉主题（对齐天翼云数字员工管理后台截图风格） */
export const ADMIN_PRIMARY = '#1677ff';
export const ADMIN_PRIMARY_RGB = '22, 119, 255';

export const adminTheme = {
  token: {
    colorPrimary: ADMIN_PRIMARY,
    borderRadius: 6,
    colorBgLayout: '#f0f2f5',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#f7f8fa',
      bodyBg: '#f0f2f5',
      triggerBg: '#f7f8fa',
    },
    Menu: {
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
      itemSelectedBg: '#ffffff',
      itemSelectedColor: ADMIN_PRIMARY,
      itemHoverBg: 'rgba(22, 119, 255, 0.06)',
      itemHoverColor: ADMIN_PRIMARY,
      itemActiveBg: '#ffffff',
      itemColor: 'rgba(0, 0, 0, 0.75)',
      groupTitleColor: 'rgba(0, 0, 0, 0.45)',
      itemBorderRadius: 6,
      itemMarginInline: 8,
      itemHeight: 40,
    },
    Button: {
      colorPrimary: ADMIN_PRIMARY,
      borderRadius: 6,
      primaryShadow: '0 2px 0 rgba(22, 119, 255, 0.1)',
    },
    Card: {
      borderRadiusLG: 8,
      paddingLG: 20,
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: 'rgba(0, 0, 0, 0.65)',
      rowHoverBg: '#f5f9ff',
      borderColor: '#f0f0f0',
    },
    Tag: {
      borderRadiusSM: 4,
    },
    Breadcrumb: {
      itemColor: 'rgba(0, 0, 0, 0.45)',
      lastItemColor: 'rgba(0, 0, 0, 0.65)',
      linkColor: 'rgba(0, 0, 0, 0.45)',
      separatorColor: 'rgba(0, 0, 0, 0.25)',
    },
  },
} as const;
