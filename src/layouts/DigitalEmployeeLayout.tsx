import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar } from 'antd';
import {
  UserOutlined,
  RobotOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  TeamOutlined,
  ScheduleOutlined,
  MessageOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Sider, Content, Header } = Layout;

const DigitalEmployeeLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { key: '/digital-employee/plaza', icon: <TeamOutlined />, label: '员工广场' },
    { key: '/digital-employee/schedule', icon: <ScheduleOutlined />, label: '定时任务' },
    { key: '/digital-employee/feedback', icon: <MessageOutlined />, label: '意见反馈' },
  ];

  const getSelectedKey = () => {
    if (location.pathname.startsWith('/digital-employee/chat')) return '/digital-employee/plaza';
    return location.pathname;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
      >
        <div style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid #f0f0f0',
        }}>
          <RobotOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          {!collapsed && <span style={{ fontSize: 16, fontWeight: 600 }}>AI 数字员工</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', marginTop: 8 }}
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
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => window.open('/user/chat', '_self')}
            >
              返回主页
            </Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => navigate('/admin/dashboard')}
            >
              管理后台
            </Button>
            <Avatar size="small" icon={<UserOutlined />} style={{ background: '#1677ff' }} />
          </div>
        </Header>
        <Content style={{ background: '#f5f5f5', overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DigitalEmployeeLayout;
