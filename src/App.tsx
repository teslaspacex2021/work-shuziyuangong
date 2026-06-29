import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import { PermissionProvider } from './contexts/PermissionContext';
import { BRAND_PRIMARY, BRAND_PRIMARY_RGB } from './theme/brand';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import DigitalEmployeeLayout from './layouts/DigitalEmployeeLayout';

import DigitalEmployeePlaza from './pages/user/DigitalEmployeePlaza';
import ChatPage from './pages/user/ChatPage';
import AgentHub from './pages/user/AgentHub';

import EmployeeSchedule from './pages/digital-employee/EmployeeSchedule';
import NewChatPage from './pages/digital-employee/NewChatPage';
import UserFeedback from './pages/digital-employee/UserFeedback';

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
import AdminFeedbackList from './pages/admin/AdminFeedbackList';
import ApprovalRecords from './pages/admin/ApprovalRecords';
import PositionTypeConfig from './pages/admin/PositionTypeConfig';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          borderRadius: 8,
          colorPrimary: BRAND_PRIMARY,
        },
        components: {
          Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: `rgba(${BRAND_PRIMARY_RGB}, 0.15)`,
            darkItemHoverBg: 'rgba(255, 255, 255, 0.05)',
            darkGroupTitleColor: 'rgba(255, 255, 255, 0.45)',
            itemSelectedBg: `rgba(${BRAND_PRIMARY_RGB}, 0.08)`,
            itemSelectedColor: BRAND_PRIMARY,
            itemHoverBg: `rgba(${BRAND_PRIMARY_RGB}, 0.04)`,
          },
          Button: {
            colorPrimary: BRAND_PRIMARY,
          },
        },
      }}
    >
      <PermissionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/digital-employee/chat" replace />} />

            {/* User Portal */}
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<Navigate to="/user/digital-employees" replace />} />
              <Route path="digital-employees" element={<DigitalEmployeePlaza />} />
              <Route path="schedule" element={<EmployeeSchedule />} />
              <Route path="agents" element={<AgentHub />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="*" element={<Navigate to="/user/digital-employees" replace />} />
            </Route>

            {/* AI Digital Employee Portal (independent) */}
            <Route path="/digital-employee" element={<DigitalEmployeeLayout />}>
              <Route index element={<Navigate to="/digital-employee/chat" replace />} />
              <Route path="new-chat" element={<NewChatPage />} />
              <Route path="schedule" element={<EmployeeSchedule />} />
              <Route path="feedback" element={<UserFeedback />} />
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
              <Route path="approval-records" element={<ApprovalRecords />} />
              <Route path="positions" element={<PositionSettings />} />
              <Route path="position-types" element={<PositionTypeConfig />} />
              <Route path="onboard" element={<OnboardManagement />} />
              <Route path="transfer" element={<TransferManagement />} />
              <Route path="demand" element={<DemandManagement />} />
              <Route path="performance" element={<PerformanceManagement />} />
              <Route path="exit" element={<ExitManagement />} />
              <Route path="task-logs" element={<TaskLogs />} />
              <Route path="feedback" element={<AdminFeedbackList />} />
              <Route path="*" element={<Dashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PermissionProvider>
    </ConfigProvider>
  );
}

export default App;
