import React, { useState, useEffect, useMemo } from 'react';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import { shiftService } from '../../services/shiftService';
import type { Student, AttendanceRecord, ShiftType, AttendanceStatus } from '../../types/database';
import { getTodayDateString, formatDate } from '../../lib/formatters';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import {
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  CheckCheck,
  Filter,
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [shifts, setShifts] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');

  const loadData = async (date: string) => {
    try {
      setLoading(true);
      const [stuData, attData, shiftData] = await Promise.all([
        studentService.getStudents(),
        attendanceService.getAttendanceByDate(date),
        shiftService.getShifts(),
      ]);
      setStudents(stuData.filter((s) => s.is_active));
      setAttendanceRecords(attData);
      setShifts(shiftData);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  // Map studentId -> AttendanceRecord
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceRecords.forEach((rec) => {
      map.set(rec.student_id, rec);
    });
    return map;
  }, [attendanceRecords]);

  // Summary counts
  const presentCount = useMemo(() => {
    return attendanceRecords.filter((a) => a.status === 'present').length;
  }, [attendanceRecords]);

  const absentCount = useMemo(() => {
    return attendanceRecords.filter((a) => a.status === 'absent').length;
  }, [attendanceRecords]);

  const handleStatusChange = async (studentId: string, newStatus: AttendanceStatus) => {
    try {
      setSavingId(studentId);
      const updated = await attendanceService.recordAttendance(
        studentId,
        selectedDate,
        newStatus
      );

      setAttendanceRecords((prev) => {
        const index = prev.findIndex((a) => a.student_id === studentId);
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = updated;
          return copy;
        }
        return [...prev, updated];
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update attendance.');
    } finally {
      setSavingId(null);
    }
  };

  const handleMarkAll = async (status: AttendanceStatus) => {
    if (!window.confirm(`Mark all visible active students as ${status.toUpperCase()} for ${formatDate(selectedDate)}?`)) {
      return;
    }

    setLoading(true);
    try {
      for (const student of filteredStudents) {
        await attendanceService.recordAttendance(student.id, selectedDate, status);
      }
      await loadData(selectedDate);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error applying batch attendance.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.student_code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesShift = shiftFilter === 'all' ? true : s.shift_id === shiftFilter;
      return matchesSearch && matchesShift;
    });
  }, [students, searchQuery, shiftFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Attendance Register</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Record, verify, and modify student study attendance with unique date guarantees
          </p>
        </div>

        {/* Date Selector Controls */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200/80 p-1.5 shadow-xs">
          <Calendar className="w-4 h-4 text-indigo-600 ml-2" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm font-semibold text-slate-800 bg-transparent border-0 focus:ring-0 cursor-pointer pr-2"
          />
          <button
            type="button"
            onClick={() => setSelectedDate(getTodayDateString())}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedDate === getTodayDateString()
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Today
          </button>
        </div>
      </div>

      {/* Attendance Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Students</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{students.length}</p>
          <span className="text-xs text-slate-400">Total eligible today</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Present</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{presentCount}</p>
          <span className="text-xs text-slate-400">
            {students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0}% Attendance
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Absent</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{absentCount}</p>
          <span className="text-xs text-slate-400">Recorded absent</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Unmarked</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {Math.max(0, students.length - (presentCount + absentCount))}
          </p>
          <span className="text-xs text-slate-400">Awaiting status</span>
        </div>
      </div>

      {/* Toolbar: Search, Shift Filter, Batch Mark */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active students..."
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-600 focus:outline-hidden"
            >
              <option value="all">All Study Shifts</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleMarkAll('present')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Present
          </button>
        </div>
      </div>

      {/* Students Attendance Table */}
      {loading ? (
        <LoadingSpinner message="Fetching attendance records..." size="lg" />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Active Students Eligible"
          description="There are no active students matching your filter criteria to record attendance."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Assigned Shift</th>
                  <th className="px-5 py-3.5">Current Status</th>
                  <th className="px-5 py-3.5 text-right">Attendance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const record = attendanceMap.get(student.id);
                  const isPresent = record?.status === 'present';
                  const isAbsent = record?.status === 'absent';
                  const isSaving = savingId === student.id;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {student.student_code}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {student.full_name}
                            </p>
                            {student.contact_number && (
                              <p className="text-[11px] text-slate-400 font-mono">
                                {student.contact_number}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        {student.shift?.name || 'Standard Shift'}
                      </td>
                      <td className="px-5 py-3.5">
                        {isPresent ? (
                          <Badge variant="success" size="sm">
                            Present
                          </Badge>
                        ) : isAbsent ? (
                          <Badge variant="danger" size="sm">
                            Absent
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            Unmarked
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleStatusChange(student.id, 'present')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Present
                          </button>

                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isAbsent
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>Register for date: {formatDate(selectedDate)}</span>
            <span>Duplicate prevention protected by PostgreSQL composite unique constraint</span>
          </div>
        </div>
      )}
    </div>
  );
};
