'use client';

import React, { useState, useEffect } from 'react';
import { QuickTask } from '@/types';
import { QUICK_5MIN_TASKS } from '@/data/mockData';
import confetti from 'canvas-confetti';
import { Zap, Play, Pause, RotateCcw, CheckCircle2, X, Sparkles, Clock, Flame } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const QuickTaskModal: React.FC = () => {
  const { requireAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<QuickTask[]>(QUICK_5MIN_TASKS);
  const [selectedTask, setSelectedTask] = useState<QuickTask | null>(QUICK_5MIN_TASKS[0]);

  // Timer state (seconds)
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Select task and reset timer accordingly
  const handleSelectTask = (task: QuickTask) => {
    setSelectedTask(task);
    setTimeLeft(task.minutes * 60);
    setIsTimerRunning(false);
  };

  // Toggle timer play/pause
  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  // Reset timer
  const resetTimer = () => {
    setIsTimerRunning(false);
    if (selectedTask) {
      setTimeLeft(selectedTask.minutes * 60);
    } else {
      setTimeLeft(300);
    }
  };

  // Mark task completed - Intercepted for Guest Mode
  const handleMarkCompleted = (taskId: string) => {
    requireAuth(() => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
      );
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }, 'Tugas Pantas 5-Minit');
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 hover:scale-105 text-white p-3.5 rounded-full shadow-[0_4px_20px_rgba(244,63,94,0.4)] flex items-center space-x-1.5 font-extrabold text-xs tracking-wide transition active:scale-95 border-2 border-white"
        title="Tugas Pantas 5-Minit"
      >
        <Zap className="w-5 h-5 fill-amber-200 animate-bounce" />
        <span className="pr-1">⚡ 5-Minit Quick Task</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl border border-rose-100 space-y-4 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base">Tugas Pantas 5-Minit</h3>
                  <p className="text-xs text-gray-400">Micro-task cepat untuk rumah sentiasa teratur!</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-rose-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timer Display Card */}
            <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 text-white rounded-3xl p-5 text-center shadow-inner space-y-3">
              <span className="text-xs font-bold text-rose-100 uppercase tracking-widest block">
                {selectedTask ? selectedTask.title : 'Pilih Tugasan di Bawah'}
              </span>

              {/* Countdown Number */}
              <div className="text-5xl font-black tracking-tight font-mono py-1">
                {formatTime(timeLeft)}
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center space-x-3 pt-1">
                <button
                  onClick={toggleTimer}
                  className="px-5 py-2.5 bg-white text-rose-600 hover:bg-rose-50 rounded-2xl font-bold text-sm shadow-md flex items-center space-x-1.5 transition active:scale-95"
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4 fill-rose-600" />
                      <span>Jeda (Pause)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-rose-600" />
                      <span>Mula Pemasa</span>
                    </>
                  )}
                </button>

                <button
                  onClick={resetTimer}
                  className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-bold transition"
                  title="Reset Pemasa"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Task Choices List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Pilih Tugasan Cepat:
              </span>

              <div className="grid grid-cols-2 gap-2">
                {tasks.map((task) => {
                  const isSelected = selectedTask?.id === task.id;

                  return (
                    <button
                      key={task.id}
                      onClick={() => handleSelectTask(task)}
                      className={`p-2.5 rounded-2xl border text-left transition flex items-center space-x-2 ${
                        isSelected
                          ? 'bg-rose-50 border-rose-400 text-rose-900 font-bold shadow-sm'
                          : 'bg-white border-gray-100 hover:border-rose-200 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{task.iconEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs truncate block">{task.title}</span>
                        <span className="text-[10px] text-gray-400 font-normal">{task.minutes} Minit</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                if (selectedTask) handleMarkCompleted(selectedTask.id);
                setIsOpen(false);
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-md transition"
            >
              ✓ Tandakan Selesai & Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
