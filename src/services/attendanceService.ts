import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { AttendanceRecord, AttendanceStatus } from '../types/database';

let demoAttendance: AttendanceRecord[] = [
  {
    id: 'att-1',
    student_id: 'stu-1',
    attendance_date: new Date().toISOString().split('T')[0],
    status: 'present',
    created_at: new Date().toISOString(),
  },
  {
    id: 'att-2',
    student_id: 'stu-2',
    attendance_date: new Date().toISOString().split('T')[0],
    status: 'present',
    created_at: new Date().toISOString(),
  },
];

export const attendanceService = {
  async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    if (!isSupabaseConfigured) {
      return demoAttendance.filter((a) => a.attendance_date === date);
    }

    const { data, error } = await supabase
      .from('attendance')
      .select('*, student:students(*)')
      .eq('attendance_date', date);

    if (error) throw error;
    return data || [];
  },

  async getAttendanceHistoryByStudent(studentId: string): Promise<AttendanceRecord[]> {
    if (!isSupabaseConfigured) {
      return demoAttendance.filter((a) => a.student_id === studentId);
    }

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('attendance_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async recordAttendance(
    studentId: string,
    attendanceDate: string,
    status: AttendanceStatus,
    notes?: string
  ): Promise<AttendanceRecord> {
    if (!isSupabaseConfigured) {
      const existingIndex = demoAttendance.findIndex(
        (a) => a.student_id === studentId && a.attendance_date === attendanceDate
      );

      if (existingIndex >= 0) {
        demoAttendance[existingIndex] = {
          ...demoAttendance[existingIndex],
          status,
          notes: notes ?? demoAttendance[existingIndex].notes,
          updated_at: new Date().toISOString(),
        };
        return demoAttendance[existingIndex];
      }

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}-${studentId}`,
        student_id: studentId,
        attendance_date: attendanceDate,
        status,
        notes,
        created_at: new Date().toISOString(),
      };
      demoAttendance.push(newRecord);
      return newRecord;
    }

    // Upsert using PostgreSQL ON CONFLICT (student_id, attendance_date)
    const { data, error } = await supabase
      .from('attendance')
      .upsert(
        {
          student_id: studentId,
          attendance_date: attendanceDate,
          status,
          notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'student_id,attendance_date' }
      )
      .select('*, student:students(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async getAttendanceSummary(startDate: string, endDate: string) {
    if (!isSupabaseConfigured) {
      const records = demoAttendance.filter(
        (a) => a.attendance_date >= startDate && a.attendance_date <= endDate
      );
      const present = records.filter((r) => r.status === 'present').length;
      const absent = records.filter((r) => r.status === 'absent').length;
      return { total: records.length, present, absent };
    }

    const { data, error } = await supabase
      .from('attendance')
      .select('status')
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate);

    if (error) throw error;
    const present = (data || []).filter((r) => r.status === 'present').length;
    const absent = (data || []).filter((r) => r.status === 'absent').length;
    return { total: (data || []).length, present, absent };
  },
};
