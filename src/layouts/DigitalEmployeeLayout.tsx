import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Tooltip } from 'antd';
import {
  UserOutlined,
  RobotOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  TeamOutlined,
  ScheduleOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Sider, Content, Header } = Layout;

const DigitalEmployeeLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { key: '/digital-employee/chat', icon: <ClockCircleOutlined />, label: '对话记录' },
    { key: '/digital-employee/plaza', icon: <TeamOutlined />, label: '员工广场' },
    { key: '/digital-employee/schedule', icon: <ScheduleOutlined />, label: '定时任务' },
  ];

  const getSelectedKey = () => {
    if (location.pathname.startsWith('/digital-employee/chat')) return '/digital-employee/chat';
    return location.pathname;
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleNewChat = () => {
    navigate('/digital-employee/chat?employeeId=DE-2026000');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={{
          background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)',
          borderRight: '1px solid #e8ecf1',
          boxShadow: '2px 0 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{
          padding: collapsed ? '20px 12px' : '20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid #e8ecf1',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(22,119,255,0.3)',
            flexShrink: 0,
          }}>
            <RobotOutlined style={{ fontSize: 18, color: '#fff' }} />
          </div>
          {!collapsed && (
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1a2332', letterSpacing: -0.3 }}>
              AI 数字员工
            </span>
          )}
        </div>
        <div style={{ padding: collapsed ? '12px 8px' : '12px 16px' }}>
          <Button
            type="primary"
            block
            icon={<PlusOutlined />}
            onClick={handleNewChat}
            style={{ borderRadius: 8, height: 38, fontWeight: 600 }}
          >
            {!collapsed && '新对话'}
          </Button>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            background: 'transparent',
            fontWeight: 500,
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
          borderBottom: '1px solid #e8ecf1',
          height: 56,
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: '#8c8c8c' }}
            />
            <Tooltip title="返回天翼云数字人平台">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => window.open('/user/agents', '_self')}
                style={{ color: '#8c8c8c' }}
              >
                返回主页
              </Button>
            </Tooltip>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="default"
              icon={<SettingOutlined />}
              onClick={() => navigate('/admin/dashboard')}
              style={{ borderRadius: 8 }}
            >
              管理后台
            </Button>
            <Avatar size={32} icon={<UserOutlined />} style={{
              background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
              cursor: 'pointer',
            }} />
          </div>
        </Header>
        <Content style={{
          background: 'linear-gradient(180deg, #f0f4f8 0%, #f5f7fa 100%)',
          overflow: 'auto',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DigitalEmployeeLayout;
