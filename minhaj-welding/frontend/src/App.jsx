import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CalculatorHub from './pages/CalculatorHub';
import ChokatCalculator from './pages/ChokatCalculator';
import GateCalculator from './pages/GateCalculator';
import RailingCalculator from './pages/RailingCalculator';
import FiberCalculator from './pages/FiberCalculator';
import RatesPage from './pages/RatesPage';
import CustomersPage from './pages/CustomersPage';
import QuotationsPage from './pages/QuotationsPage';
import QuotationDetailPage from './pages/QuotationDetailPage';
import InvoicesPage from './pages/InvoicesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ExpensesPage from './pages/ExpensesPage';
import MachineryPage from './pages/MachineryPage';
import UsersPage from './pages/UsersPage';
import AuditLogPage from './pages/AuditLogPage';
import CatalogPage from './pages/CatalogPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import InventoryPage from './pages/InventoryPage';
import LeadsPage from './pages/LeadsPage';
import MediaLibraryPage from './pages/MediaLibraryPage';
import WebsiteCmsPage from './pages/WebsiteCmsPage';
import CustomFieldsPage from './pages/CustomFieldsPage';
import PublicSitePage from './pages/PublicSitePage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/site" element={<PublicSitePage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/calculators" element={<CalculatorHub />} />
        <Route path="/calculators/chokat/:categoryId" element={<ChokatCalculator />} />
        <Route path="/calculators/gate" element={<GateCalculator />} />
        <Route path="/calculators/railing" element={<RailingCalculator />} />
        <Route path="/calculators/fiber" element={<FiberCalculator />} />
        <Route path="/rates" element={<RatesPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/quotations" element={<QuotationsPage />} />
        <Route path="/quotations/:id" element={<QuotationDetailPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/machinery" element={<MachineryPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/media" element={<MediaLibraryPage />} />
        <Route path="/website" element={<WebsiteCmsPage />} />
        <Route path="/custom-fields" element={<CustomFieldsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/audit-log" element={<AuditLogPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
