import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Student } from '../types/database';

let demoStudents: Student[] = [
  {
    id: 'stu-1',
    student_code: 'STU-101',
    full_name: 'Aarav Sharma',
    contact_number: '9876543210',
    enrollment_date: '2026-09-01',
    shift_id: 's3',
    monthly_fee: 750,
    is_active: true,
    notes: 'Preparing for UPSC Civil Services',
    created_at: new Date().toISOString(),
    shift: {
      id: 's3',
      name: 'Full Day Shift (8 Hours)',
      duration_hours: 8,
      price: 750,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'stu-2',
    student_code: 'STU-102',
    full_name: 'Pooja Verma',
    contact_number: '9812345678',
    enrollment_date: '2026-09-15',
    shift_id: 's1',
    monthly_fee: 400,
    is_active: true,
    notes: 'GATE Computer Science preparation',
    created_at: new Date().toISOString(),
    shift: {
      id: 's1',
      name: 'Morning Shift (4 Hours)',
      duration_hours: 4,
      price: 400,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'stu-3',
    student_code: 'STU-103',
    full_name: 'Rohan Mehra',
    contact_number: '9988776655',
    enrollment_date: '2026-10-01',
    shift_id: 's2',
    monthly_fee: 400,
    is_active: false,
    notes: 'Shift completed for semester exam',
    created_at: new Date().toISOString(),
    shift: {
      id: 's2',
      name: 'Evening Shift (4 Hours)',
      duration_hours: 4,
      price: 400,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
];

export const studentService = {
  async getStudents(): Promise<Student[]> {
    if (!isSupabaseConfigured) {
      return [...demoStudents];
    }

    const { data, error } = await supabase
      .from('students')
      .select('*, shift:shift_types(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getStudentById(id: string): Promise<Student | null> {
    if (!isSupabaseConfigured) {
      return demoStudents.find((s) => s.id === id) || null;
    }

    const { data, error } = await supabase
      .from('students')
      .select('*, shift:shift_types(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'shift'>): Promise<Student> {
    if (!isSupabaseConfigured) {
      // Check code uniqueness in demo mode
      if (demoStudents.some((s) => s.student_code.toLowerCase() === student.student_code.toLowerCase())) {
        throw new Error(`Student code '${student.student_code}' already exists.`);
      }

      const newStudent: Student = {
        ...student,
        id: `stu-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      demoStudents.unshift(newStudent);
      return newStudent;
    }

    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select('*, shift:shift_types(*)')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Student code '${student.student_code}' is already registered in the database.`);
      }
      throw error;
    }
    return data;
  },

  async updateStudent(
    id: string,
    updates: Partial<Omit<Student, 'id' | 'created_at' | 'shift'>>
  ): Promise<Student> {
    if (!isSupabaseConfigured) {
      demoStudents = demoStudents.map((s) => (s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s));
      const updated = demoStudents.find((s) => s.id === id);
      if (!updated) throw new Error('Student record not found');
      return updated;
    }

    const { data, error } = await supabase
      .from('students')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, shift:shift_types(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async toggleStudentStatus(id: string, is_active: boolean): Promise<Student> {
    return this.updateStudent(id, { is_active });
  },
};
