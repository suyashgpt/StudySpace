import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { StudentListPage } from './features/students/StudentListPage';
import { DeskAllocationPage } from './features/seats/DeskAllocationPage';
import { ShiftManagerPage } from './features/shifts/ShiftManagerPage';
import { AttendancePage } from './features/attendance/AttendancePage';
import { FeeManagementPage } from './features/fees/FeeManagementPage';
import { ExpenseListPage } from './features/expenses/ExpenseListPage';
import { BookCirculationPage } from './features/books/BookCirculationPage';
import { ReportsPage } from './features/reports/ReportsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Administrator Dashboard & Modules */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="students" element={<StudentListPage />} />
            <Route path="desks" element={<DeskAllocationPage />} />
            <Route path="shifts" element={<ShiftManagerPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="fees" element={<FeeManagementPage />} />
            <Route path="expenses" element={<ExpenseListPage />} />
            <Route path="books" element={<BookCirculationPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
