import React, { useState, useEffect, useMemo } from 'react';
import { studentService } from '../../services/studentService';
import { shiftService } from '../../services/shiftService';
import type { Student, ShiftType } from '../../types/database';
import { StudentModal } from './StudentModal';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatINR, formatDate } from '../../lib/formatters';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  UserCheck,
  UserX,
  Phone,
  AlertCircle,
} from 'lucide-react';

export const StudentListPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [shifts, setShifts] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [stuData, shiftData] = await Promise.all([
        studentService.getStudents(),
        shiftService.getShifts(),
      ]);
      setStudents(stuData);
      setShifts(shiftData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (student: Student) => {
    const actionWord = student.is_active ? 'deactivate' : 'reactivate';
    const confirmMessage = `Are you sure you want to ${actionWord} ${student.full_name}? Historical attendance and payment records will remain preserved.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await studentService.toggleStudentStatus(student.id, !student.is_active);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update student status.');
    }
  };

  // Filtered students calculation
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.contact_number && s.contact_number.includes(searchQuery));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? s.is_active
          : !s.is_active;

      const matchesShift =
        shiftFilter === 'all' ? true : s.shift_id === shiftFilter;

      return matchesSearch && matchesStatus && matchesShift;
    });
  }, [students, searchQuery, statusFilter, shiftFilter]);

  if (loading) {
    return <LoadingSpinner message="Loading registered students..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage library student admissions, shifts, monthly fees, and active rosters
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Enroll New Student
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, code or phone..."
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-600 focus:outline-hidden"
          >
            <option value="all">All Statuses ({students.length})</option>
            <option value="active">Active Only ({students.filter((s) => s.is_active).length})</option>
            <option value="inactive">Inactive ({students.filter((s) => !s.is_active).length})</option>
          </select>

          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-600 focus:outline-hidden"
          >
            <option value="all">All Shifts</option>
            {shifts.map((sh) => (
              <option key={sh.id} value={sh.id}>
                {sh.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Found"
          description={
            searchQuery || statusFilter !== 'all' || shiftFilter !== 'all'
              ? 'No student records match the selected search criteria or filters.'
              : 'Start by enrolling your first student into StudySpace.'
          }
          actionLabel="Enroll New Student"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Assigned Shift</th>
                  <th className="px-5 py-3.5">Monthly Fee</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Enrollment</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-indigo-700">
                      {student.student_code}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div>
                        {student.full_name}
                        {student.notes && (
                          <p className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
                            {student.notes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {student.contact_number ? (
                        <span className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {student.contact_number}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-700">
                      {student.shift?.name || 'Unassigned'}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {formatINR(student.monthly_fee)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={student.is_active ? 'success' : 'neutral'} size="sm">
                        {student.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(student.enrollment_date)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(student)}
                          title="Edit Student"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(student)}
                          title={student.is_active ? 'Deactivate Student' : 'Reactivate Student'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            student.is_active
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {student.is_active ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredStudents.length} of {students.length} students</span>
            <span>Historical records preserved upon deactivation</span>
          </div>
        </div>
      )}

      {/* Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        studentToEdit={selectedStudent}
      />
    </div>
  );
};
