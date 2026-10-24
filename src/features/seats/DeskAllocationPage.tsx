import React, { useState, useMemo } from 'react';
import { deskService, type Desk } from '../../services/deskService';
import {
  RotateCcw,
  Plus,
  Volume2,
  Wind,
  Zap,
  Repeat,
  LogOut,
  Sliders,
  Info,
  Laptop,
} from 'lucide-react';

export const DeskAllocationPage: React.FC = () => {
  const [desks, setDesks] = useState<Desk[]>(deskService.getDesks());
  const [selectedDeskId, setSelectedDeskId] = useState<string>('d-a14');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showAllocateModal, setShowAllocateModal] = useState<boolean>(false);

  // Form states for Allocate / Reassign modal
  const [allocName, setAllocName] = useState('');
  const [allocGoal, setAllocGoal] = useState('UPSC Civil Services 2025');
  const [allocShift, setAllocShift] = useState('Morning');
  const [allocPass, setAllocPass] = useState('Full Access Pass');

  const selectedDesk = useMemo(() => {
    return desks.find((d) => d.id === selectedDeskId) || desks[0];
  }, [desks, selectedDeskId]);

  // Counts
  const totalDesks = desks.length;
  const occupiedCount = desks.filter((d) => d.isOccupied).length;
  const availableCount = totalDesks - occupiedCount;
  const occupancyPercent = Math.round((occupiedCount / totalDesks) * 100);

  // Filtered by wing
  const quietWingDesks = useMemo(() => {
    return desks.filter((d) => {
      if (d.wing !== 'quiet') return false;
      if (selectedShiftFilter === 'all') return true;
      if (!d.isOccupied) return true;
      return d.occupant?.shift.toLowerCase().includes(selectedShiftFilter.toLowerCase());
    });
  }, [desks, selectedShiftFilter]);

  const podDesks = useMemo(() => {
    return desks.filter((d) => {
      if (d.wing !== 'pods') return false;
      if (selectedShiftFilter === 'all') return true;
      if (!d.isOccupied) return true;
      return d.occupant?.shift.toLowerCase().includes(selectedShiftFilter.toLowerCase());
    });
  }, [desks, selectedShiftFilter]);

  const handleSyncTelemetry = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setDesks(deskService.getDesks());
      setIsSyncing(false);
    }, 600);
  };

  const handleRelease = (deskId: string) => {
    if (!window.confirm(`Release ${selectedDesk.deskNumber}? The seat will become immediately available for allocation.`)) {
      return;
    }
    const updated = deskService.releaseSeat(deskId);
    setDesks((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleOpenAllocate = () => {
    setAllocName(selectedDesk.occupant?.name || '');
    setAllocGoal(selectedDesk.occupant?.examOrGoal || 'Civil Services 2025');
    setAllocShift(selectedDesk.occupant?.shift || 'Morning');
    setAllocPass(selectedDesk.occupant?.passCategory || 'Full Access Pass');
    setShowAllocateModal(true);
  };

  const handleConfirmAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocName.trim()) return;

    const initials = allocName
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const updated = deskService.reassignSeat(selectedDesk.id, {
      name: allocName.trim(),
      shortName: allocName.trim(),
      avatarText: initials,
      examOrGoal: allocGoal.trim(),
      shift: allocShift,
      memberId: `MEM-${Math.floor(1000 + Math.random() * 9000)}`,
      passCategory: allocPass,
      shiftSlot: `${allocShift} Slot (07:00 – 14:00)`,
      elapsedHours: '1h 00m',
      remainingHours: '6h 00m',
      amenities: ['Ergonomic Chair', 'Reading Lamp', '65W USB-C'],
    });

    setDesks((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setShowAllocateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Study Spaces</span>
            <span>•</span>
            <span>Floor Plan</span>
            <span>•</span>
            <span className="text-slate-800 font-semibold">Main Level</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Desk & Shift Allocation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time interactive floor plan and seat availability
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSyncTelemetry}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Telemetry</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAllocate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Allocate Seat</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Legend Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Shifts' },
            { id: 'morning', label: 'Morning (07:00 – 14:00)' },
            { id: 'evening', label: 'Evening (14:30 – 21:30)' },
            { id: 'full', label: 'Full Day 24x7' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedShiftFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedShiftFilter === tab.id
                  ? 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                  : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Occupied <strong className="text-slate-900">{occupiedCount}</strong></span>
          </div>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border border-slate-400 bg-white" />
            <span className="text-slate-500 font-medium">Available <strong className="text-slate-700">{availableCount}</strong></span>
          </div>
          <span className="text-slate-300">/</span>
          <div className="text-slate-600 font-medium">
            Occupancy <strong className="text-emerald-700 font-bold">{occupancyPercent}%</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: 2/3 Floor Plan, 1/3 Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Floor Plan (Col Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Quiet Sanctuary Wing */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Quiet Sanctuary Wing
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Acoustic baffled silent study area • Desks A-01 to A-16
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                ● Sound Level: 32 dB
              </span>
            </div>

            {/* 4x4 Grid of Desks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quietWingDesks.map((desk) => {
                const isSelected = selectedDeskId === desk.id;
                return (
                  <div
                    key={desk.id}
                    onClick={() => setSelectedDeskId(desk.id)}
                    className={`cursor-pointer rounded-xl p-3 border transition-all duration-200 text-left relative ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                        : desk.isOccupied
                        ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                        : 'bg-white border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">
                        {desk.deskNumber}
                      </span>
                      {desk.isOccupied ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/80" />
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Available
                        </span>
                      )}
                    </div>

                    {desk.isOccupied && desk.occupant ? (
                      <div>
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {desk.occupant.shortName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {desk.occupant.examOrGoal}
                        </p>
                      </div>
                    ) : (
                      <div className="py-1">
                        <p className="text-[10px] text-slate-400 font-medium">Ready to allocate</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Focus Pods */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Focus Pods
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Private acoustic glass booths • Desks B-01 to B-16
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                ● 40 dB Sound Enclosure
              </span>
            </div>

            {/* 4x4 Grid of Pods */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {podDesks.map((desk) => {
                const isSelected = selectedDeskId === desk.id;
                return (
                  <div
                    key={desk.id}
                    onClick={() => setSelectedDeskId(desk.id)}
                    className={`cursor-pointer rounded-xl p-3 border transition-all duration-200 text-left relative ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                        : desk.isOccupied
                        ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                        : 'bg-white border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">
                        {desk.deskNumber}
                      </span>
                      {desk.isOccupied ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/80" />
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Available
                        </span>
                      )}
                    </div>

                    {desk.isOccupied && desk.occupant ? (
                      <div>
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {desk.occupant.shortName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {desk.occupant.examOrGoal}
                        </p>
                      </div>
                    ) : (
                      <div className="py-1">
                        <p className="text-[10px] text-slate-400 font-medium">Ready to allocate</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Bottom Environmental Telemetry Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-white border border-slate-200/80 p-3.5 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-500">Ambient Fresh Air</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">412 <span className="text-xs font-normal text-slate-400">ppm CO2</span></p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                <Wind className="w-4 h-4" />
              </div>
            </div>

            <div className="rounded-xl bg-white border border-slate-200/80 p-3.5 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-500">Average Noise Floor</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">31.4 <span className="text-xs font-normal text-slate-400">dB • Silent</span></p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
            </div>

            <div className="rounded-xl bg-white border border-slate-200/80 p-3.5 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-500">Optimal Power Draw</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">2.84 <span className="text-xs font-normal text-slate-400">kW Eco-mode</span></p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Active Inspector Panel (Col Span 1) */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs text-left space-y-5">
            {/* Inspector Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700 uppercase">
                  Active Inspector
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedDesk.wingName}
                </span>
              </div>
              <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                <Sliders className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Desk {selectedDesk.deskNumber}
              </h2>
            </div>

            {/* Current Occupant Details */}
            {selectedDesk.isOccupied && selectedDesk.occupant ? (
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500">
                  <span>CURRENT OCCUPANT</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {selectedDesk.occupant.avatarText}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {selectedDesk.occupant.name}
                    </h4>
                    <p className="text-xs text-indigo-600 mt-0.5 font-medium">
                      {selectedDesk.occupant.examOrGoal}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Member ID</span>
                    <span className="font-mono text-slate-800 font-bold">
                      {selectedDesk.occupant.memberId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Pass Category</span>
                    <span className="text-slate-700 font-semibold truncate block">
                      {selectedDesk.occupant.passCategory}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 border border-dashed border-slate-300 p-5 text-center">
                <p className="text-xs text-slate-500 font-medium">No active student occupant assigned to this desk.</p>
                <button
                  type="button"
                  onClick={handleOpenAllocate}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  Allocate Student
                </button>
              </div>
            )}

            {/* Shift Window */}
            {selectedDesk.isOccupied && selectedDesk.occupant && (
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-500">SHIFT WINDOW</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    In Session
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-900">
                  {selectedDesk.occupant.shiftSlot}
                </p>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-indigo-600 w-2/3" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Elapsed: {selectedDesk.occupant.elapsedHours}</span>
                  <span>Remaining: {selectedDesk.occupant.remainingHours}</span>
                </div>
              </div>
            )}

            {/* Desk Amenities */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                DESK AMENITIES & HARDWARE
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ergonomic Herman Miller chair, focused warm reading lamp, 65W USB-C PD charging station, 32 dB acoustic baffle enclosure.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(selectedDesk.occupant?.amenities || ['Ergonomic Chair', 'Reading Lamp', '65W USB-C']).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-white text-[10px] font-medium text-slate-700 border border-slate-200 shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Inspector Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleOpenAllocate}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Repeat className="w-4 h-4" />
                <span>Reassign Seat</span>
              </button>

              {selectedDesk.isOccupied && (
                <button
                  type="button"
                  onClick={() => handleRelease(selectedDesk.id)}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <LogOut className="w-4 h-4 text-slate-500" />
                  <span>Release Seat</span>
                </button>
              )}
            </div>
          </div>

          {/* Sync Tip Card */}
          <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-3.5 flex items-start gap-2.5 text-xs text-indigo-900">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Desks automatically synchronize with student biometric RFID check-ins. Tapping any seat allows instant manual re-dispatch or release.
            </p>
          </div>
        </div>
      </div>

      {/* Modal for Allocation / Reassigning */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Assign Seat {selectedDesk.deskNumber}
              </h3>
              <button
                type="button"
                onClick={() => setShowAllocateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAllocation} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={allocName}
                  onChange={(e) => setAllocName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Exam / Goal</label>
                <input
                  type="text"
                  value={allocGoal}
                  onChange={(e) => setAllocGoal(e.target.value)}
                  placeholder="e.g. UPSC Civil Services 2025"
                  className="w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Shift Slot</label>
                  <select
                    value={allocShift}
                    onChange={(e) => setAllocShift(e.target.value)}
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Morning">Morning (07:00 – 14:00)</option>
                    <option value="Evening">Evening (14:30 – 21:30)</option>
                    <option value="Full Day 24x7">Full Day 24x7</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pass Category</label>
                  <select
                    value={allocPass}
                    onChange={(e) => setAllocPass(e.target.value)}
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Full Access Pass">Full Access Pass</option>
                    <option value="Standard Pass">Standard Pass</option>
                    <option value="Pod Private Pass">Pod Private Pass</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Save Seat Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
