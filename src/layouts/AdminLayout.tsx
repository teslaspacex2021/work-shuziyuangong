import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
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
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Sider, Content, Header } = Layout;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: 'monitor',
      label: '运营监控',
      type: 'group' as const,
      children: [
        { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '运营驾驶舱' },
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
        },
        {
          key: '/admin/alerts',
          icon: <AlertOutlined />,
          label: <span>数字人预警 <Badge count={3} size="small" offset={[6, -2]} /></span>,
        },
      ],
    },
    {
      key: 'employee-mgmt',
      label: '数字员工管理',
      type: 'group' as const,
      children: [
        { key: '/admin/employees', icon: <TeamOutlined />, label: '员工管理' },
        { key: '/admin/positions', icon: <SettingOutlined />, label: '岗位设置' },
      ],
    },
    {
      key: 'hr-mgmt',
      label: '人事管理',
      type: 'group' as const,
      children: [
        { key: '/admin/onboard', icon: <UserSwitchOutlined />, label: '入职管理' },
        { key: '/admin/performance', icon: <TrophyOutlined />, label: '绩效管理' },
        { key: '/admin/exit', icon: <LogoutOutlined />, label: '退出管理' },
      ],
    },
    {
      key: 'logs-group',
      label: '任务日志',
      type: 'group' as const,
      children: [
        { key: '/admin/task-logs', icon: <FileTextOutlined />, label: '任务调度日志' },
        { key: '/admin/schedule', icon: <ScheduleOutlined />, label: '调度配置' },
      ],
    },
  ];

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
            <Badge count={8} size="small">
              <BellOutlined style={{ fontSize: 16, cursor: 'pointer' }} onClick={() => navigate('/admin/pending')} />
            </Badge>
            <Dropdown menu={userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ background: '#1677ff' }} />
                <span style={{ fontSize: 14 }}>管理员</span>
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
