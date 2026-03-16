import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import DigitalEmployeeList from './pages/user/DigitalEmployeeList';
import DigitalEmployeeChat from './pages/user/DigitalEmployeeChat';
import Dashboard from './pages/admin/Dashboard';
import AlertsPage from './pages/admin/AlertsPage';
import LifecycleManagement from './pages/admin/LifecycleManagement';
import SkillConfig from './pages/admin/SkillConfig';
import KnowledgeConfig from './pages/admin/KnowledgeConfig';
import TokensEfficiency from './pages/admin/TokensEfficiency';
import TaskManagement from './pages/admin/TaskManagement';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          borderRadius: 8,
          colorPrimary: '#1677ff',
        },
        components: {
          Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(22, 119, 255, 0.15)',
            darkItemHoverBg: 'rgba(255, 255, 255, 0.05)',
            darkGroupTitleColor: 'rgba(255, 255, 255, 0.45)',
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/user/digital-employees" replace />} />

          {/* User Portal */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="/user/digital-employees" replace />} />
            <Route path="digital-employees" element={<DigitalEmployeeList />} />
            <Route path="digital-employees/:id" element={<DigitalEmployeeChat />} />
            <Route path="*" element={<DigitalEmployeeList />} />
          </Route>

          {/* Admin Portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="lifecycle" element={<LifecycleManagement />} />
            <Route path="skills" element={<SkillConfig />} />
            <Route path="knowledge" element={<KnowledgeConfig />} />
            <Route path="tokens" element={<TokensEfficiency />} />
            <Route path="tasks" element={<TaskManagement />} />
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
