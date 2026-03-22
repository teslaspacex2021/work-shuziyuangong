import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Tag, Select } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ScheduleOutlined,
  RobotOutlined,
  UserOutlined,
  AlertOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  AuditOutlined,
  SettingOutlined,
  FileTextOutlined,
  UserSwitchOutlined,
  TrophyOutlined,
  LogoutOutlined,
  SwapOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { usePermission } from '../contexts/PermissionContext';
import type { SystemRole } from '../mock/data';

const { Sider, Content, Header } = Layout;

const roleColorMap: Record<string, string> = {
  '系统管理员': 'red',
  '部门经理': 'blue',
  '人力部门': 'green',
  '普通用户': 'default',
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
      label: '预警与待办',
      type: 'group' as const,
      children: [
        {
          key: '/admin/pending',
          icon: <AuditOutlined />,
          label: <span>我的待办 <Badge count={5} size="small" offset={[6, -2]} /></span>,
          permission: 'pending',
        },
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
        { key: '/admin/positions', icon: <SettingOutlined />, label: '岗位设置', permission: 'positions' },
      ],
    },
    {
      key: 'hr-mgmt',
      label: '人事管理',
      type: 'group' as const,
      children: [
        { key: '/admin/onboard', icon: <UserSwitchOutlined />, label: '入职管理', permission: 'onboard' },
        { key: '/admin/transfer', icon: <SwapOutlined />, label: '调动管理', permission: 'transfer' },
        { key: '/admin/demand', icon: <SolutionOutlined />, label: '需求管理', permission: 'demand' },
        { key: '/admin/performance', icon: <TrophyOutlined />, label: '绩效管理', permission: 'performance' },
        { key: '/admin/exit', icon: <LogoutOutlined />, label: '退出管理', permission: 'exit' },
      ],
    },
    {
      key: 'logs-group',
      label: '任务日志',
      type: 'group' as const,
      children: [
        { key: '/admin/task-logs', icon: <FileTextOutlined />, label: '任务调度日志', permission: 'task-logs' },
        { key: '/admin/schedule', icon: <ScheduleOutlined />, label: '调度配置', permission: 'schedule' },
      ],
    },
  ];

  const menuItems = allMenuItems.map((group) => ({
    ...group,
    children: group.children.filter((item) => canAccessRoute(item.key)),
  })).filter((group) => group.children.length > 0);

  const getSelectedKey = () => {
    return location.pathname;
  };

  const userMenu = {
    items: [
      { key: 'user', label: '切换到用户端', icon: <RobotOutlined />, onClick: () => navigate('/user/chat') },
      { key: 'logout', label: '退出登录', icon: <LogoutOutlined /> },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        collapsible
        collapsed={collapsed}
        trigger={null}
        theme="dark"
        style={{ background: '#0a1929' }}
      >
        <div style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <RobotOutlined style={{ fontSize: 22, color: '#1677ff' }} />
          {!collapsed && (
            <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>
              数字员工管理后台
            </span>
          )}
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderRight: 'none',
            marginTop: 8,
          }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
          height: 56,
          lineHeight: '56px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{ cursor: 'pointer', fontSize: 16 }}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Select
              size="small"
              value={user.role}
              onChange={(v) => switchRole(v as SystemRole)}
              style={{ width: 120 }}
              options={[
                { label: '系统管理员', value: '系统管理员' },
                { label: '部门经理', value: '部门经理' },
                { label: '人力部门', value: '人力部门' },
                { label: '普通用户', value: '普通用户' },
              ]}
            />
            <Badge count={8} size="small">
              <BellOutlined style={{ fontSize: 16, cursor: 'pointer' }} onClick={() => navigate('/admin/pending')} />
            </Badge>
            <Dropdown menu={userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ background: '#1677ff' }} />
                <span style={{ fontSize: 14 }}>{user.name}</span>
                <Tag color={roleColorMap[user.role]} style={{ fontSize: 11, marginLeft: -4 }}>{user.role}</Tag>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ background: '#f0f2f5', padding: 24, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
