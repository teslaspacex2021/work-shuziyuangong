import React, { useMemo, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Tag, Select, Breadcrumb, ConfigProvider } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  RobotOutlined,
  UserOutlined,
  AlertOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  FileTextOutlined,
  LogoutOutlined,
  AuditOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { usePermission } from '../contexts/PermissionContext';
import type { SystemRole } from '../mock/data';
import { adminTheme } from '../theme/admin';
import './AdminLayout.css';

const { Sider, Content, Header } = Layout;

const roleColorMap: Record<string, string> = {
  '系统专员': 'red',
  '部门智能体专员': 'blue',
  '人力专员': 'green',
  '审计角色': 'purple',
  '普通用户': 'default',
};

const routeTitleMap: Record<string, string> = {
  '/admin/dashboard': '运营驾驶舱',
  '/admin/alerts': '数字人预警',
  '/admin/employees': '员工管理',
  '/admin/approval-records': '审批记录',
  '/admin/positions': '岗位设置',
  '/admin/position-types': '岗位所属条线',
  '/admin/task-logs': '任务调度日志',
  '/admin/feedback': '意见反馈',
  '/admin/pending': '我的待办',
  '/admin/onboard': '入职管理',
  '/admin/transfer': '调动管理',
  '/admin/demand': '需求管理',
  '/admin/performance': '绩效管理',
  '/admin/exit': '退出管理',
};

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, canAccessRoute, switchRole } = usePermission();

  const allMenuItems = [
    {
      key: 'monitor',
      label: '运营监控',
      type: 'group' as const,
      children: [
        { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '运营驾驶舱', permission: 'dashboard' },
      ],
    },
    {
      key: 'alerts-group',
      label: '预警监控',
      type: 'group' as const,
      children: [
        {
          key: '/admin/alerts',
          icon: <AlertOutlined />,
          label: <span>数字人预警 <Badge count={3} size="small" offset={[6, -2]} /></span>,
          permission: 'alerts',
        },
      ],
    },
    {
      key: 'employee-mgmt',
      label: '数字员工管理',
      type: 'group' as const,
      children: [
        { key: '/admin/employees', icon: <TeamOutlined />, label: '员工管理', permission: 'employees' },
        { key: '/admin/approval-records', icon: <AuditOutlined />, label: '审批记录', permission: 'employees' },
        { key: '/admin/positions', icon: <SettingOutlined />, label: '岗位设置', permission: 'positions' },
        { key: '/admin/position-types', icon: <TagOutlined />, label: '岗位所属条线', permission: 'positions' },
      ],
    },
    {
      key: 'logs-group',
      label: '任务日志',
      type: 'group' as const,
      children: [
        { key: '/admin/task-logs', icon: <FileTextOutlined />, label: '任务调度日志', permission: 'task-logs' },
      ],
    },
    {
      key: 'feedback-group',
      label: '用户服务',
      type: 'group' as const,
      children: [
        { key: '/admin/feedback', icon: <AlertOutlined />, label: '意见反馈', permission: 'feedback' },
      ],
    },
  ];

  const menuItems = allMenuItems.map((group) => ({
    ...group,
    children: group.children.filter((item) => canAccessRoute(item.key)),
  })).filter((group) => group.children.length > 0);

  const selectedKey = location.pathname;
  const pageTitle = routeTitleMap[selectedKey] ?? '管理后台';

  const breadcrumbItems = useMemo(() => [
    { title: <Link to="/admin/dashboard">首页</Link> },
    { title: pageTitle },
  ], [pageTitle]);

  const userMenu = {
    items: [
      { key: 'user', label: '切换到用户端', icon: <RobotOutlined />, onClick: () => navigate('/digital-employee/chat') },
      { key: 'logout', label: '退出登录', icon: <LogoutOutlined /> },
    ],
  };

  return (
    <ConfigProvider theme={adminTheme} autoInsertSpaceInButton={false}>
      <Layout className="admin-layout">
        <Header className="admin-header">
          <div className="admin-header-brand">
            <div className="admin-logo">
              <div className="admin-logo-mark">云</div>
              <span className="admin-logo-text">天翼云</span>
            </div>
            <span className="admin-header-title">数字员工管理后台</span>
          </div>
          <div className="admin-header-actions">
            <Select
              size="small"
              value={user.role}
              onChange={(v) => switchRole(v as SystemRole)}
              style={{ width: 140 }}
              options={[
                { label: '系统专员', value: '系统专员' },
                { label: '部门智能体专员', value: '部门智能体专员' },
                { label: '普通用户', value: '普通用户' },
                { label: '人力专员', value: '人力专员' },
                { label: '审计角色', value: '审计角色' },
              ]}
            />
            <Badge count={3} size="small">
              <BellOutlined
                style={{ fontSize: 16, cursor: 'pointer', color: 'rgba(0,0,0,0.65)' }}
                onClick={() => navigate('/admin/alerts')}
              />
            </Badge>
            <Dropdown menu={userMenu} placement="bottomRight">
              <div className="admin-user">
                <Avatar size="small" icon={<UserOutlined />} style={{ background: '#1677ff' }} />
                <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>{user.name}</span>
                <Tag color={roleColorMap[user.role]} style={{ fontSize: 11, marginInlineEnd: 0 }}>
                  {user.role}
                </Tag>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Layout className="admin-body">
          <Sider
            className="admin-sider"
            width={220}
            collapsible
            collapsed={collapsed}
            trigger={null}
            theme="light"
          >
            <div
              className="admin-sider-collapse"
              onClick={() => setCollapsed(!collapsed)}
              role="button"
              aria-label={collapsed ? '展开菜单' : '收起菜单'}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <Menu
              className="admin-menu"
              mode="inline"
              theme="light"
              selectedKeys={[selectedKey]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
            />
          </Sider>
          <Content className="admin-content">
            <Breadcrumb items={breadcrumbItems} />
            <div className="admin-page">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
