import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import { PermissionProvider } from './contexts/PermissionContext';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

import DigitalEmployeeDirectory from './pages/user/DigitalEmployeeDirectory';
import ChatPage from './pages/user/ChatPage';
import AgentHub from './pages/user/AgentHub';

import Dashboard from './pages/admin/Dashboard';
import PendingTasks from './pages/admin/PendingTasks';
import AlertsWarning from './pages/admin/AlertsWarning';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import PositionSettings from './pages/admin/PositionSettings';
import OnboardManagement from './pages/admin/OnboardManagement';
import TransferManagement from './pages/admin/TransferManagement';
import DemandManagement from './pages/admin/DemandManagement';
import PerformanceManagement from './pages/admin/PerformanceManagement';
import ExitManagement from './pages/admin/ExitManagement';
import TaskLogs from './pages/admin/TaskLogs';

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
      <PermissionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/user/chat" replace />} />

            {/* User Portal */}
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<Navigate to="/user/chat" replace />} />
              <Route path="digital-employees" element={<DigitalEmployeeDirectory />} />
              <Route path="agents" element={<AgentHub />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="*" element={<ChatPage />} />
            </Route>

            {/* Admin Portal */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="pending" element={<PendingTasks />} />
              <Route path="alerts" element={<AlertsWarning />} />
              <Route path="employees" element={<EmployeeManagement />} />
              <Route path="positions" element={<PositionSettings />} />
              <Route path="onboard" element={<OnboardManagement />} />
              <Route path="transfer" element={<TransferManagement />} />
              <Route path="demand" element={<DemandManagement />} />
              <Route path="performance" element={<PerformanceManagement />} />
              <Route path="exit" element={<ExitManagement />} />
              <Route path="task-logs" element={<TaskLogs />} />
              <Route path="schedule" element={<TaskLogs />} />
              <Route path="*" element={<Dashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PermissionProvider>
    </ConfigProvider>
  );
}

export default App;
