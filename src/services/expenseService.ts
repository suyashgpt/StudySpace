import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Expense } from '../types/database';

let demoExpenses: Expense[] = [
  {
    id: 'exp-1',
    description: 'October High-Speed WiFi Broadband Bill',
    category: 'internet',
    amount: 1199,
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'upi',
    notes: '200 Mbps commercial fiber line',
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    description: 'Commercial RO Drinking Water 20L Cans (x10)',
    category: 'water',
    amount: 400,
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    notes: 'Bisleri water supplier',
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp-3',
    description: 'Study Room Air Conditioner Servicing & Gas Topup',
    category: 'maintenance',
    amount: 1500,
    expense_date: '2026-10-15',
    payment_method: 'cash',
    notes: 'Voltas split AC hall 1',
    created_at: new Date().toISOString(),
  },
];

export const expenseService = {
  async getExpenses(): Promise<Expense[]> {
    if (!isSupabaseConfigured) {
      return [...demoExpenses];
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createExpense(expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    if (expense.amount <= 0) {
      throw new Error('Expense amount must be greater than zero.');
    }

    if (!isSupabaseConfigured) {
      const newExp: Expense = {
        ...expense,
        id: `exp-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      demoExpenses.unshift(newExp);
      return newExp;
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateExpense(id: string, updates: Partial<Omit<Expense, 'id' | 'created_at'>>): Promise<Expense> {
    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new Error('Expense amount must be greater than zero.');
    }

    if (!isSupabaseConfigured) {
      demoExpenses = demoExpenses.map((e) => (e.id === id ? { ...e, ...updates } : e));
      const updated = demoExpenses.find((e) => e.id === id);
      if (!updated) throw new Error('Expense record not found.');
      return updated;
    }

    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
