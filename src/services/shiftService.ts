import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ShiftType } from '../types/database';

// Initial default shift records
let demoShifts: ShiftType[] = [
  {
    id: 's1',
    name: 'Morning Shift (4 Hours)',
    duration_hours: 4.0,
    price: 400.0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 's2',
    name: 'Evening Shift (4 Hours)',
    duration_hours: 4.0,
    price: 400.0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 's3',
    name: 'Full Day Shift (8 Hours)',
    duration_hours: 8.0,
    price: 750.0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 's4',
    name: 'Night Shift (6 Hours)',
    duration_hours: 6.0,
    price: 600.0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const shiftService = {
  async getShifts(): Promise<ShiftType[]> {
    if (!isSupabaseConfigured) {
      return [...demoShifts];
    }
    const { data, error } = await supabase
      .from('shift_types')
      .select('*')
      .order('price', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createShift(shift: Omit<ShiftType, 'id' | 'created_at'>): Promise<ShiftType> {
    if (!isSupabaseConfigured) {
      const newShift: ShiftType = {
        ...shift,
        id: `s-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      demoShifts.push(newShift);
      return newShift;
    }

    const { data, error } = await supabase
      .from('shift_types')
      .insert([shift])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateShift(id: string, updates: Partial<Omit<ShiftType, 'id' | 'created_at'>>): Promise<ShiftType> {
    if (!isSupabaseConfigured) {
      demoShifts = demoShifts.map((s) => (s.id === id ? { ...s, ...updates } : s));
      const updated = demoShifts.find((s) => s.id === id);
      if (!updated) throw new Error('Shift not found');
      return updated;
    }

    const { data, error } = await supabase
      .from('shift_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
