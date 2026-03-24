import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  RobotOutlined,
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  AppstoreOutlined,
  BookOutlined,
  BulbOutlined,
  AimOutlined,
  HistoryOutlined,
  FundProjectionScreenOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Sider, Content, Header } = Layout;

const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { key: '/user/chat', icon: <UserOutlined />, label: '个人助手' },
    { key: '/user/match', icon: <TeamOutlined />, label: '人岗匹配' },
    { key: '/user/marketing', icon: <BulbOutlined />, label: '营销智能体' },
    { key: '/user/opportunity', icon: <AimOutlined />, label: '翼达（商机挖掘）' },
    { key: '/user/agents', icon: <AppstoreOutlined />, label: '更多智能体' },
    { type: 'divider' as const },
    { key: '/user/knowledge', icon: <BookOutlined />, label: '知识中心' },
    { key: 'digital-employee-link', icon: <RobotOutlined />, label: 'AI数字员工' },
    {
      key: 'knowledge-ops',
      icon: <FundProjectionScreenOutlined />,
      label: '知识运营',
      children: [
        { key: '/user/knowledge-ops/overview', label: '运营概览' },
        { key: '/user/knowledge-ops/content', label: '内容管理' },
      ],
    },
    { key: '/user/recent', icon: <HistoryOutlined />, label: '最近对话' },
  ];

  const getSelectedKey = () => {
    if (location.pathname === '/user/agents') return '/user/agents';
    if (location.pathname.startsWith('/user/chat')) return '/user/chat';
    if (location.pathname.startsWith('/user/digital-employees')) return 'digital-employee-link';
    return location.pathname;
  };

  const handleMenuClick = (key: string) => {
    if (key === 'digital-employee-link') {
      window.open('/digital-employee/plaza', '_blank');
      return;
    }
    if (['/user/match', '/user/marketing', '/user/opportunity', '/user/knowledge', '/user/recent', '/user/knowledge-ops/overview', '/user/knowledge-ops/content'].includes(key)) {
      navigate('/user/agents');
      return;
    }
    navigate(key);
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
          <RobotOutlined style={{ fontSize: 24, color: '#e4393c' }} />
          {!collapsed && <span style={{ fontSize: 16, fontWeight: 600 }}>天翼云数字人</span>}
        </div>
        <div style={{ padding: '12px 16px' }}>
          <Button
            type="primary"
            danger
            block
            icon={<PlusOutlined />}
            style={{ borderRadius: 8 }}
            onClick={() => navigate('/user/chat')}
          >
            {!collapsed && '新对话'}
          </Button>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
          style={{ border: 'none' }}
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
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => navigate('/admin/dashboard')}
            >
              管理后台
            </Button>
            <Avatar size="small" icon={<UserOutlined />} style={{ background: '#e4393c' }} />
          </div>
        </Header>
        <Content style={{ background: '#f5f5f5', overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserLayout;
