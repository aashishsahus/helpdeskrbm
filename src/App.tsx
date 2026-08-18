import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CreateTicketModal } from './components/CreateTicketModal';
import { TicketDetailsModal } from './components/TicketDetailsModal';
import { GoogleSheetSyncToast } from './components/GoogleSheetSyncToast';
import { SyncActivityModal } from './components/SyncActivityModal';

import { EmployeeDashboardView } from './views/EmployeeDashboardView';
import { SupportDashboardView } from './views/SupportDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { TicketDirectoryView } from './views/TicketDirectoryView';
import { KnowledgeBaseView } from './views/KnowledgeBaseView';
import { ReportsView } from './views/ReportsView';
import { FeedbackDashboardView } from './views/FeedbackDashboardView';

import { UserManagement } from './views/AdminPanel/UserManagement';
import { DepartmentManagement } from './views/AdminPanel/DepartmentManagement';
import { CategoryManagement } from './views/AdminPanel/CategoryManagement';
import { SLAManagement } from './views/AdminPanel/SLAManagement';
import { GoogleDriveIntegration } from './views/AdminPanel/GoogleDriveIntegration';
import { GoogleAppsScriptView } from './views/AdminPanel/GoogleAppsScriptView';
import { AuditLogsView } from './views/AdminPanel/AuditLogsView';
import { SystemSettingsView } from './views/AdminPanel/SystemSettingsView';
import { MasterDropdownsView } from './views/AdminPanel/MasterDropdownsView';
import { RolePermissionsView } from './views/AdminPanel/RolePermissionsView';
import { ArchivedVaultView } from './views/AdminPanel/ArchivedVaultView';
import { EmailWhatsAppHubView } from './views/AdminPanel/EmailWhatsAppHubView';

import { LoginModal } from './components/LoginModal';
import { LoginPage } from './views/LoginPage';

const MainLayout: React.FC = () => {
  const { activeView, currentUser } = useApp();
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  // If user is not authenticated, show standalone Login Page first
  if (!currentUser) {
    return <LoginPage />;
  }

  const renderCurrentView = () => {
    const userRole = currentUser?.role || 'Employee';

    switch (activeView) {
      case 'dashboard':
      case 'employee_dashboard':
      case 'support_dashboard':
      case 'admin_dashboard':
        if (activeView === 'employee_dashboard') return <EmployeeDashboardView />;
        if (activeView === 'support_dashboard') return <SupportDashboardView />;
        if (activeView === 'admin_dashboard') return <AdminDashboardView />;

        if (userRole === 'Admin' || userRole === 'Super Admin') {
          return <AdminDashboardView />;
        }
        if (userRole === 'Support Agent' || userRole === 'Support Manager') {
          return <SupportDashboardView />;
        }
        return <EmployeeDashboardView />;

      case 'tickets':
      case 'ticket_directory':
        return <TicketDirectoryView />;

      case 'feedback':
      case 'feedback_dashboard':
        return <FeedbackDashboardView />;

      case 'knowledge-base':
      case 'knowledge_base':
        return <KnowledgeBaseView />;

      case 'email-whatsapp':
      case 'email_whatsapp':
      case 'notification_hub':
        return <EmailWhatsAppHubView />;

      case 'reports':
        return <ReportsView />;

      case 'dropdown-settings':
      case 'admin_dropdowns':
        return <MasterDropdownsView />;

      case 'users':
      case 'admin_users':
        return <UserManagement />;

      case 'departments':
      case 'admin_departments':
        return <DepartmentManagement />;

      case 'categories':
      case 'admin_categories':
        return <CategoryManagement />;

      case 'sla':
      case 'admin_sla':
        return <SLAManagement />;

      case 'google-drive':
      case 'admin_drive':
        return <GoogleDriveIntegration />;

      case 'apps-script':
      case 'admin_script':
        return <GoogleAppsScriptView />;

      case 'audit-logs':
      case 'admin_audit':
        return <AuditLogsView />;

      case 'role-permissions':
      case 'role_permissions':
      case 'admin_roles':
        return <RolePermissionsView />;

      case 'archived-data':
      case 'archived_vault':
      case 'admin_archive':
        return <ArchivedVaultView />;

      case 'settings':
      case 'admin_settings':
        return <SystemSettingsView />;

      default:
        if (userRole === 'Admin' || userRole === 'Super Admin') {
          return <AdminDashboardView />;
        }
        if (userRole === 'Support Agent' || userRole === 'Support Manager') {
          return <SupportDashboardView />;
        }
        return <EmployeeDashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F3F4F6] text-gray-900 font-sans">
      {/* Enterprise Technical Dashboard Sidebar */}
      <Sidebar />

      {/* Main Right Content Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Navigation */}
        <Header />

        {/* View Main Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
          {renderCurrentView()}
        </main>
      </div>

      {/* Modals & Overlays */}
      <CreateTicketModal />
      <TicketDetailsModal />
      <SyncActivityModal />
      <GoogleSheetSyncToast />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
