'use client';

import React, { useState } from 'react';
import { CleaningTask, ZoneType } from '@/types';
import confetti from 'canvas-confetti';
import { Sparkles, Plus, Trash2, RefreshCw, Check, Home, Bath, BedDouble, Utensils } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useAuth } from '@/context/AuthContext';
import {
  addCleaningTaskToSupabase,
  toggleCleaningTaskInSupabase,
  deleteCleaningTaskFromSupabase,
} from '@/lib/supabaseService';

interface ZoneCleanerProps {
  tasks: CleaningTask[];
  setTasks: React.Dispatch<React.SetStateAction<CleaningTask[]>>;
  currentUser?: SupabaseUser | null;
}

export const ZoneCleaner: React.FC<ZoneCleanerProps> = ({ tasks, setTasks, currentUser: propUser }) => {
  const { user: contextUser, requireAuth } = useAuth();
  const user = propUser !== undefined ? propUser : contextUser;

  const [selectedZone, setSelectedZone] = useState<string>('Semua');
  const [newTitle, setNewTitle] = useState('');
  const [newZone, setNewZone] = useState<ZoneType>('Dapur');

  const zones: ZoneType[] = ['Dapur', 'Ruang Tamu', 'Bilik Air', 'Bilik Tidur'];

  // Toggle task completed - Intercepted for Guest Mode
  const handleToggleTask = (id: string) => {
    requireAuth(async () => {
      const targetTask = tasks.find((t) => t.id === id);
      const newDoneState = !targetTask?.completed;

      if (user) {
        await toggleCleaningTaskInSupabase(id, newDoneState);
      }

      setTasks((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, completed: newDoneState } : t));
        const totalCount = updated.length;
        const completedCount = updated.filter((t) => t.completed).length;

        if (totalCount > 0 && completedCount === totalCount) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.5 },
          });
        }
        return updated;
      });
    }, 'Tanda Tugasan Selesai');
  };

  // Add new task - Intercepted for Guest Mode
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    requireAuth(async () => {
      const taskData = {
        title: newTitle.trim(),
        zone: newZone,
        completed: false,
        estimatedMinutes: 5,
      };

      if (user) {
        const inserted = await addCleaningTaskToSupabase(user.id, taskData);
        if (inserted) {
          setTasks((prev) => [...prev, inserted]);
          setNewTitle('');
          return;
        }
      }

      const newTask: CleaningTask = {
        id: `cl-${Date.now()}`,
        ...taskData,
      };

      setTasks((prev) => [...prev, newTask]);
      setNewTitle('');
    }, 'Tambah Tugasan Kemas Rumah');
  };

  // Delete task - Intercepted for Guest Mode
  const handleDeleteTask = (id: string) => {
    requireAuth(async () => {
      if (user) {
        await deleteCleaningTaskFromSupabase(id);
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }, 'Padam Tugasan Kemas Rumah');
  };

  // Reset all tasks to incomplete for a new day - Intercepted for Guest Mode
  const handleResetDailyTasks = () => {
    requireAuth(() => {
      if (confirm('Adakah anda ingin menetapkan semula semua tugasan kemas rumah untuk hari ini?')) {
        setTasks((prev) => prev.map((t) => ({ ...t, completed: false })));
      }
    }, 'Set Semula Tugasan Hari Baru');
  };

  // Statistics
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => (selectedZone === 'Semua' ? true : t.zone === selectedZone));

  // Zone icon mapping
  const getZoneIcon = (zone: ZoneType) => {
    switch (zone) {
      case 'Dapur':
        return Utensils;
      case 'Ruang Tamu':
        return Home;
      case 'Bilik Air':
        return Bath;
      case 'Bilik Tidur':
        return BedDouble;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Overall Progress Header Card */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white rounded-3xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-1.5">
              <Sparkles className="w-5 h-5" />
              Kemasan Rumah Hari Ini
            </h3>
            <p className="text-xs text-rose-100">
              {completedCount} daripada {totalCount} tugasan selesai
            </p>
          </div>
          <span className="text-2xl font-black bg-white/20 px-3.5 py-1 rounded-2xl backdrop-blur-md shadow-inner">
            {percent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3.5 bg-white/30 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-white rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleResetDailyTasks}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-xl font-bold flex items-center gap-1 backdrop-blur-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Set Semula Hari Baru
          </button>
        </div>
      </div>

      {/* Zone Selector Pills */}
      <div className="flex space-x-1.5 overflow-x-auto py-1 scrollbar-none">
        {['Semua', ...zones].map((z) => {
          const isActive = selectedZone === z;
          return (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-rose-100 hover:border-rose-300'
              }`}
            >
              <span>{z}</span>
            </button>
          );
        })}
      </div>

      {/* Add New Custom Task */}
      <form onSubmit={handleAddTask} className="bg-white rounded-2xl p-3 border border-rose-100 shadow-sm space-y-2">
        <span className="text-xs font-bold text-gray-700 block">Tambah Tugasan Kemas Rumah Baru:</span>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="e.g. Lap cermin kabinet..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-50 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-800"
          />
          <select
            value={newZone}
            onChange={(e) => setNewZone(e.target.value as ZoneType)}
            className="px-2 py-2 bg-gray-50 border border-rose-200 rounded-xl text-xs text-gray-800 focus:outline-none"
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Cleaning Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const ZoneIcon = getZoneIcon(task.zone);

          return (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task.id)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                task.completed
                  ? 'bg-emerald-50/70 border-emerald-200 text-gray-400'
                  : 'bg-white border-rose-100 shadow-sm hover:border-rose-300 text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                    task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-rose-300 bg-white'
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div>
                  <p className={`text-xs font-bold ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-0.5">
                    <span className="flex items-center gap-1 font-medium bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded-md">
                      <ZoneIcon className="w-3 h-3 text-rose-500" />
                      {task.zone}
                    </span>
                    <span>•</span>
                    <span>~{task.estimatedMinutes} Minit</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTask(task.id);
                }}
                className="text-gray-300 hover:text-rose-600 p-1 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
