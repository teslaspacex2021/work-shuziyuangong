import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Badge } from 'antd';
import {
  UserOutlined,
  RobotOutlined,
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  BookOutlined,
  HistoryOutlined,
  FundProjectionScreenOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { digitalEmployees } from '../mock/data';
import { BRAND_PRIMARY } from '../theme/brand';

const { Sider, Content, Header } = Layout;

const activeEmployeeCount = digitalEmployees.filter((e) => e.status === 'ACTIVE').length;

const NAVIGABLE_MENU_KEY = '/user/digital-employees';

const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/user/digital-employees',
      icon: <RobotOutlined />,
      label: collapsed ? '数字员工' : (
        <span>数字员工 <Badge count={activeEmployeeCount} size="small" offset={[6, -2]} /></span>
      ),
    },
    { key: '/user/schedule', icon: <ScheduleOutlined />, label: '日程' },
    { key: 'more', icon: <AppstoreOutlined />, label: '更多' },
    { type: 'divider' as const },
    { key: '/user/knowledge', icon: <BookOutlined />, label: '知识中心' },
    { key: 'knowledge-ops', icon: <FundProjectionScreenOutlined />, label: '知识运营' },
    { key: '/user/recent', icon: <HistoryOutlined />, label: '最近对话' },
  ];

  const selectedMenuKey = location.pathname.startsWith(NAVIGABLE_MENU_KEY)
    ? NAVIGABLE_MENU_KEY
    : null;

  const handleMenuClick = (key: string) => {
    if (key !== NAVIGABLE_MENU_KEY) return;
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
          <RobotOutlined style={{ fontSize: 24, color: BRAND_PRIMARY }} />
          {!collapsed && <span style={{ fontSize: 16, fontWeight: 600 }}>天翼云数字人</span>}
        </div>
        <div style={{ padding: '12px 16px' }}>
          <Button
            type="primary"
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
          selectedKeys={selectedMenuKey ? [selectedMenuKey] : []}
          items={menuItems}
          onClick={({ key, domEvent }) => {
            if (key !== NAVIGABLE_MENU_KEY) {
              domEvent.preventDefault();
              domEvent.stopPropagation();
              return;
            }
            handleMenuClick(key);
          }}
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
            <Avatar size="small" icon={<UserOutlined />} style={{ background: BRAND_PRIMARY }} />
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
