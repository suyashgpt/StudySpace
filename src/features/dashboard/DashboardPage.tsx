import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Armchair,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Volume2,
  Thermometer,
  Wind,
  Plus,
  IndianRupee,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { StudentModal } from '../students/StudentModal';
import { RecordPaymentModal } from '../fees/RecordPaymentModal';
import type { FeeInvoice } from '../../types/database';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [chartView, setChartView] = useState<'today' | '7day'>('today');
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showCollectDuesModal, setShowCollectDuesModal] = useState(false);

  // Sample active invoice for collect dues quick trigger
  const sampleInvoice: FeeInvoice = {
    id: 'inv-quick',
    student_id: 'stu-1',
    billing_month: '2026-10-01',
    amount_due: 11200,
    due_date: '2026-10-10',
    status: 'partial',
    balance_remaining: 11200,
    total_paid: 124500,
    created_at: new Date().toISOString(),
    student: {
      id: 'stu-1',
      student_code: 'MEM-8920',
      full_name: 'Aarav Sharma',
      enrollment_date: '2026-09-01',
      monthly_fee: 11200,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  };

  return (
    <div className="space-y-7 text-left">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Library Overview & Daily Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            A peaceful, live glance at study space occupancy, monthly revenues, and restful environmental conditions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCollectDuesModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
          >
            <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
            <span>Collect Dues</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAdmitModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Admit Member</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Live Occupancy */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500">Live Occupancy</span>
              <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Armchair className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">84%</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                ↗ Calm inflow
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 w-[84%]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <span>42 of 50 seats active</span>
            <span className="text-slate-800 font-semibold">8 open carrels</span>
          </div>
        </div>

        {/* Card 2: Monthly Revenue */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500">Monthly Revenue</span>
              <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">₹ 1,24,500</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-emerald-500 w-[92%]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <span>92% realization rate</span>
            <span className="text-amber-600 font-semibold">₹11,200 pending</span>
          </div>
        </div>

        {/* Card 3: Active Members */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Members</span>
              <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">148</span>
              <span className="text-xs text-slate-500">enrolled</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                94% retention
              </span>
            </div>

            {/* Multi-segment Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4 flex">
              <div className="h-full bg-indigo-600 w-[76%]" />
              <div className="h-full bg-cyan-500 w-[24%]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <span>112 reserved desks</span>
            <span className="text-slate-800 font-semibold">36 flex passes</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Occupancy Insights (2/3) + Chamber Ambiance (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy & Quietude Insights (Col Span 2) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Occupancy & Quietude Insights
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily desk density curve and shift distributions across peaceful study hours.
                </p>
              </div>

              {/* Toggle Pills */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setChartView('today')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    chartView === 'today'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('7day')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    chartView === '7day'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  7-day avg
                </button>
              </div>
            </div>

            {/* Custom Atmospheric Density Bar Chart */}
            <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
              {[
                { time: '6 AM', val: 35, highlight: false },
                { time: '8 AM', val: 65, highlight: false },
                { time: '11 AM', val: 92, highlight: true, label: '92%' },
                { time: '1 PM', val: 55, highlight: false },
                { time: '3 PM', val: 60, highlight: false },
                { time: '6 PM', val: 88, highlight: true, label: '88%' },
                { time: '8 PM', val: 70, highlight: false },
                { time: '10 PM', val: 50, highlight: false },
                { time: '1 AM', val: 30, highlight: false },
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {bar.highlight && bar.label ? (
                    <span className="text-[10px] font-bold text-indigo-600 mb-0.5">
                      {bar.label}
                    </span>
                  ) : (
                    <span className="h-3.5" />
                  )}
                  <div
                    style={{ height: `${bar.val}%` }}
                    className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                      bar.highlight
                        ? 'bg-gradient-to-t from-indigo-700 to-indigo-500 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                  />
                  <span className={`text-[10px] mt-1 ${bar.highlight ? 'text-indigo-700 font-bold' : 'text-slate-400 font-medium'}`}>
                    {bar.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Shifts Distribution Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5">
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
              <span className="text-[11px] font-medium text-slate-500 block">Morning Shift</span>
              <p className="text-sm font-bold text-slate-900 mt-1">92% booked</p>
              <span className="text-[10px] text-slate-400 block mt-0.5">07:00 – 14:00</span>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
              <span className="text-[11px] font-medium text-slate-500 block">Evening Shift</span>
              <p className="text-sm font-bold text-slate-900 mt-1">88% booked</p>
              <span className="text-[10px] text-slate-400 block mt-0.5">14:00 – 22:00</span>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
              <span className="text-[11px] font-medium text-slate-500 block">Night Sanctuary</span>
              <p className="text-sm font-bold text-slate-900 mt-1">64% booked</p>
              <span className="text-[10px] text-slate-400 block mt-0.5">22:00 – 05:00</span>
            </div>
          </div>
        </div>

        {/* Chamber Ambiance (Col Span 1) */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Chamber Ambiance
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                Optimal
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Continuous environmental conditions tuned for long, focused study.
            </p>

            {/* Environmental Sensors List */}
            <div className="space-y-3 mt-5">
              {/* Sound Level */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 shadow-2xs text-slate-700 flex items-center justify-center">
                    <Volume2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                      Sound Level
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">32.4 dB</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium">Whisper Quiet</span>
              </div>

              {/* Temperature */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 shadow-2xs text-slate-700 flex items-center justify-center">
                    <Thermometer className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                      Temperature
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">21.5 °C</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium">Balanced</span>
              </div>

              {/* Air Quality Index */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 shadow-2xs text-slate-700 flex items-center justify-center">
                    <Wind className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                      Air Quality Index
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">418 PPM CO2</p>
                  </div>
                </div>
                <span className="text-xs text-emerald-600 font-bold">Pure Flow</span>
              </div>
            </div>
          </div>

          {/* Bottom Dampeners Note */}
          <div className="rounded-xl bg-emerald-50/60 border border-emerald-200/80 p-3 flex items-center gap-2.5 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-medium">Acoustic dampeners & fresh HEPA ventilation active.</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Member Activity (2/3) + Sanctuary Dispatches (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Member Activity (Col Span 2) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Recent Member Activity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest contactless member check-ins and desk checkouts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/students')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
            >
              View all activity →
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                id: '1',
                initials: 'AK',
                name: 'Aarav Kulkarni',
                role: 'Civil Services Fellow · Pass #8821',
                desk: 'Pod A-04',
                deskType: '(Quiet Carrel)',
                time: '14:28',
                status: 'Active',
              },
              {
                id: '2',
                initials: 'RS',
                name: 'Rhea Singhania',
                role: 'CA Finalist Scholar · Pass #9042',
                desk: 'Pod B-12',
                deskType: '(Dual Monitor)',
                time: '14:15',
                status: 'Active',
              },
              {
                id: '3',
                initials: 'NM',
                name: 'Nikhil Menon',
                role: 'Medical Research Fellow · Pass #7619',
                desk: 'Carrel 02',
                deskType: '(Silent Nook)',
                time: '13:58',
                status: 'Active',
              },
            ].map((activity) => (
              <div
                key={activity.id}
                className="rounded-xl bg-slate-50/80 border border-slate-200/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                    {activity.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {activity.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {activity.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-slate-700 font-medium">
                    <span>{activity.desk}</span>
                    <span className="text-[11px] text-slate-400 ml-1.5">{activity.deskType}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{activity.time}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                    ● Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sanctuary Dispatches (Col Span 1) */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Sanctuary Dispatches
              </h2>
              <span className="text-xs text-slate-400 font-medium">Today</span>
            </div>

            <div className="space-y-3">
              {/* Dispatch 1 */}
              <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-3.5 text-xs text-left">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Quiet Zone Demand</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  Zone A pods reached 98% occupancy today. Consider allocating 4 additional carrels for evening prep.
                </p>
              </div>

              {/* Dispatch 2 */}
              <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-3.5 text-xs text-left">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Auto-Settlements</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  89% of monthly renewals settled via recurring UPI passes without manual follow-up required.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/desks')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <span>Allocate Desks & Quiet Zones</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Modals for Quick Action triggers */}
      <StudentModal
        isOpen={showAdmitModal}
        onClose={() => setShowAdmitModal(false)}
        onSuccess={() => setShowAdmitModal(false)}
      />

      <RecordPaymentModal
        isOpen={showCollectDuesModal}
        onClose={() => setShowCollectDuesModal(false)}
        onSuccess={() => setShowCollectDuesModal(false)}
        invoice={sampleInvoice}
      />
    </div>
  );
};
