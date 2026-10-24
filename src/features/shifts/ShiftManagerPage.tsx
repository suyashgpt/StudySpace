import React, { useState, useEffect } from 'react';
import { shiftService } from '../../services/shiftService';
import type { ShiftType } from '../../types/database';
import { ShiftModal } from './ShiftModal';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatINR } from '../../lib/formatters';
import { Clock, Plus, Edit2, CheckCircle2 } from 'lucide-react';

export const ShiftManagerPage: React.FC = () => {
  const [shifts, setShifts] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftType | null>(null);

  const loadShifts = async () => {
    try {
      setLoading(true);
      const data = await shiftService.getShifts();
      setShifts(data);
    } catch (err) {
      console.error('Failed to load shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const handleOpenAdd = () => {
    setSelectedShift(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shift: ShiftType) => {
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner message="Loading study shift tiers..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Study Shift Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure reading room shift durations, seat hours, and monthly pricing schedules
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Shift Tier
        </button>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Clock className="w-5 h-5" />
                </div>
                <Badge variant={shift.is_active ? 'success' : 'neutral'} size="sm">
                  {shift.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <h3 className="text-base font-bold text-slate-900">{shift.name}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Reading Hall Access: <strong className="text-slate-700">{shift.duration_hours} Hours / Day</strong>
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Configured Fee</span>
                  <p className="text-xl font-bold text-slate-900">{formatINR(shift.price)}</p>
                </div>
                <span className="text-xs text-slate-500">per student / month</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => handleOpenEdit(shift)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Shift Settings
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Operational Guide Panel */}
      <div className="rounded-xl bg-indigo-50/70 text-slate-700 p-5 border border-indigo-100 text-xs leading-relaxed space-y-2">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          <span>Operational Guide: Configurable Shift Tiers</span>
        </div>
        <p>
          In traditional libraries, shift timings are rigid or maintained manually in paper notebooks. StudySpace decouples shifts into independent relational database records (<code>shift_types</code>). When a student is assigned to a shift, their monthly fee is automatically populated according to that shift's current rate, while still permitting customized concessions if granted by the administrator.
        </p>
      </div>

      <ShiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadShifts}
        shiftToEdit={selectedShift}
      />
    </div>
  );
};
