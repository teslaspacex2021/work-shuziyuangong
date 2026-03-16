import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  ScheduleOutlined,
  ThunderboltOutlined,
  BookOutlined,
  RobotOutlined,
  UserOutlined,
  AlertOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
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
        { key: '/admin/alerts', icon: <AlertOutlined />, label: <span>预警与待办 <Badge count={6} size="small" offset={[6, -2]} /></span> },
      ],
    },
    {
      key: 'employee-mgmt',
      label: '数字员工管理',
      type: 'group' as const,
      children: [
        { key: '/admin/lifecycle', icon: <TeamOutlined />, label: '全生命周期管理' },
        { key: '/admin/skills', icon: <ThunderboltOutlined />, label: '技能配置' },
        { key: '/admin/knowledge', icon: <BookOutlined />, label: '知识配置' },
        { key: '/admin/tokens', icon: <DollarOutlined />, label: 'Tokens与效益' },
        { key: '/admin/tasks', icon: <ScheduleOutlined />, label: '任务调度' },
      ],
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/lifecycle')) return '/admin/lifecycle';
    return path;
  };

  const userMenu = {
    items: [
      { key: 'user', label: '切换到用户端', onClick: () => navigate('/user/digital-employees') },
      { key: 'logout', label: '退出登录' },
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
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar size="small" icon={<UserOutlined />} style={{ background: '#1677ff' }} />
              <span style={{ fontSize: 14 }}>管理员</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ background: '#f0f2f5', padding: 24, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
