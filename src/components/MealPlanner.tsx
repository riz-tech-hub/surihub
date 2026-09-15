'use client';

import React, { useState } from 'react';
import { PantryItem, Recipe, MealPlanDay, BatchPrepItem, DayOfWeek } from '@/types';
import { SAMPLE_RECIPES } from '@/data/mockData';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Utensils,
  CheckCircle2,
  Plus,
  Trash2,
  ChefHat,
  PackageCheck,
  ChevronRight,
  Flame,
  Sparkles,
  Clock,
  BookOpen,
  X,
  Check
} from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { saveMealPlanDayToSupabase } from '@/lib/supabaseService';

interface MealPlannerProps {
  pantryItems: PantryItem[];
  mealPlan: MealPlanDay[];
  setMealPlan: React.Dispatch<React.SetStateAction<MealPlanDay[]>>;
  batchPrep: BatchPrepItem[];
  setBatchPrep: React.Dispatch<React.SetStateAction<BatchPrepItem[]>>;
  setPantryItems: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  currentUser?: SupabaseUser | null;
}

export const MealPlanner: React.FC<MealPlannerProps> = ({
  pantryItems,
  mealPlan,
  setMealPlan,
  batchPrep,
  setBatchPrep,
  setPantryItems,
  currentUser,
}) => {
  const [subTab, setSubTab] = useState<'weekly' | 'recipes' | 'batch'>('weekly');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Isnin');

  // Modal for editing day meal
  const [isEditDayModalOpen, setIsEditDayModalOpen] = useState(false);
  const [editSarapan, setEditSarapan] = useState('');
  const [editTengahHari, setEditTengahHari] = useState('');
  const [editMalam, setEditMalam] = useState('');

  // Recipe Detail Modal
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  // New batch prep task input
  const [newBatchTask, setNewBatchTask] = useState('');
  const [newBatchCategory, setNewBatchCategory] = useState('Persediaan');

  // Days list
  const daysList: DayOfWeek[] = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'];
  const currentDayPlan = mealPlan.find((m) => m.day === selectedDay) || {
    day: selectedDay,
    sarapan: '',
    makanTengahHari: '',
    makanMalam: '',
  };

  // Open edit day modal
  const handleOpenEditDay = () => {
    setEditSarapan(currentDayPlan.sarapan);
    setEditTengahHari(currentDayPlan.makanTengahHari);
    setEditMalam(currentDayPlan.makanMalam);
    setIsEditDayModalOpen(true);
  };

  // Save day meal plan
  const handleSaveDayPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPlan: MealPlanDay = {
      day: selectedDay,
      sarapan: editSarapan.trim(),
      makanTengahHari: editTengahHari.trim(),
      makanMalam: editMalam.trim(),
    };

    if (currentUser) {
      await saveMealPlanDayToSupabase(currentUser.id, updatedPlan);
    }

    setMealPlan((prev) =>
      prev.map((m) => (m.day === selectedDay ? updatedPlan : m))
    );
    setIsEditDayModalOpen(false);
  };

  // Quick assign recipe to selected day's meal
  const handleAssignRecipeToDay = async (recipeName: string, mealType: 'sarapan' | 'tengahHari' | 'malam') => {
    const updatedPlan: MealPlanDay = {
      day: selectedDay,
      sarapan: mealType === 'sarapan' ? recipeName : currentDayPlan.sarapan,
      makanTengahHari: mealType === 'tengahHari' ? recipeName : currentDayPlan.makanTengahHari,
      makanMalam: mealType === 'malam' ? recipeName : currentDayPlan.makanMalam,
    };

    if (currentUser) {
      await saveMealPlanDayToSupabase(currentUser.id, updatedPlan);
    }

    setMealPlan((prev) =>
      prev.map((m) => (m.day === selectedDay ? updatedPlan : m))
    );
  };

  // Batch prep toggle check
  const handleToggleBatchItem = (id: string) => {
    setBatchPrep((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item));
      const allDone = updated.every((item) => item.completed);
      if (allDone && updated.length > 0) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      return updated;
    });
  };

  // Add custom batch prep item
  const handleAddBatchTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchTask.trim()) return;
    const newItem: BatchPrepItem = {
      id: `bp-${Date.now()}`,
      task: newBatchTask.trim(),
      category: newBatchCategory,
      completed: false,
    };
    setBatchPrep((prev) => [...prev, newItem]);
    setNewBatchTask('');
  };

  // Delete batch task
  const handleDeleteBatchTask = (id: string) => {
    setBatchPrep((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculate matching ingredients for a recipe
  const getRecipeMatchInfo = (recipe: Recipe) => {
    const pantryNameList = pantryItems.map((p) => p.name.toLowerCase());
    let matchCount = 0;

    const ingredientDetails = recipe.requiredIngredients.map((req) => {
      const hasItem = pantryNameList.some((pName) => pName.includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(pName));
      if (hasItem) matchCount++;
      return { ...req, isAvailable: hasItem };
    });

    const total = recipe.requiredIngredients.length;
    const isFullMatch = matchCount === total;
    const isPartialMatch = matchCount > 0 && !isFullMatch;

    return {
      matchCount,
      total,
      percentage: total > 0 ? Math.round((matchCount / total) * 100) : 0,
      isFullMatch,
      isPartialMatch,
      ingredientDetails,
    };
  };

  // Batch prep stats
  const completedPrepCount = batchPrep.filter((b) => b.completed).length;
  const prepProgressPercent = batchPrep.length > 0 ? Math.round((completedPrepCount / batchPrep.length) * 100) : 0;

  return (
    <div className="space-y-4 pb-20">
      {/* Sub-tab Navigation */}
      <div className="bg-white rounded-2xl p-1.5 border border-rose-100 shadow-sm grid grid-cols-3 gap-1 text-xs font-bold text-center">
        <button
          onClick={() => setSubTab('weekly')}
          className={`py-2 rounded-xl transition flex items-center justify-center space-x-1 ${
            subTab === 'weekly' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-600 hover:bg-rose-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Mingguan</span>
        </button>
        <button
          onClick={() => setSubTab('recipes')}
          className={`py-2 rounded-xl transition flex items-center justify-center space-x-1 ${
            subTab === 'recipes' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-600 hover:bg-rose-50'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5" />
          <span>Cadangan</span>
        </button>
        <button
          onClick={() => setSubTab('batch')}
          className={`py-2 rounded-xl transition flex items-center justify-center space-x-1 ${
            subTab === 'batch' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-600 hover:bg-rose-50'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Batch Prep</span>
        </button>
      </div>

      {/* SUB-TAB 1: WEEKLY MEAL PLAN */}
      {subTab === 'weekly' && (
        <div className="space-y-4">
          {/* Day Selector Pills */}
          <div className="flex space-x-1.5 overflow-x-auto py-1 scrollbar-none">
            {daysList.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 flex flex-col items-center ${
                  selectedDay === d
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 border border-rose-100 hover:border-rose-300'
                }`}
              >
                <span>{d}</span>
              </button>
            ))}
          </div>

          {/* Selected Day Meals Card */}
          <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  Menu Hari {selectedDay}
                </h3>
                <p className="text-xs text-gray-400">Susunan sajian harian keluarga</p>
              </div>

              <button
                onClick={handleOpenEditDay}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition"
              >
                Kemaskini Menu
              </button>
            </div>

            {/* Meals breakdown */}
            <div className="space-y-3">
              {/* Sarapan */}
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider block">
                    🌅 Sarapan Pagi
                  </span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {currentDayPlan.sarapan || <span className="italic text-gray-400 font-normal">Belum dirancang</span>}
                  </p>
                </div>
              </div>

              {/* Makan Tengah Hari */}
              <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-extrabold text-rose-700 uppercase tracking-wider block">
                    ☀️ Makan Tengah Hari
                  </span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {currentDayPlan.makanTengahHari || (
                      <span className="italic text-gray-400 font-normal">Belum dirancang</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Makan Malam */}
              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider block">
                    🌙 Makan Malam
                  </span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {currentDayPlan.makanMalam || <span className="italic text-gray-400 font-normal">Belum dirancang</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Suggestion Recipes Carousel */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              Pilih dari Resipi Kegemaran ke Menu Hari {selectedDay}
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              {SAMPLE_RECIPES.slice(0, 3).map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-2xl p-3 border border-rose-100 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{recipe.imageEmoji}</span>
                    <div>
                      <h5 className="font-bold text-gray-800 text-xs">{recipe.name}</h5>
                      <span className="text-[10px] text-gray-400">{recipe.prepTime} • {recipe.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-[11px]">
                    <button
                      onClick={() => handleAssignRecipeToDay(recipe.name, 'tengahHari')}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition"
                    >
                      + Tengah Hari
                    </button>
                    <button
                      onClick={() => handleAssignRecipeToDay(recipe.name, 'malam')}
                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition"
                    >
                      + Malam
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RECIPE SUGGESTIONS BASED ON PANTRY */}
      {subTab === 'recipes' && (
        <div className="space-y-3">
          <div className="bg-rose-50 rounded-2xl p-3.5 border border-rose-200 text-rose-900 text-xs space-y-1">
            <p className="font-bold text-sm flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-rose-600" />
              Cadangan Resipi Pintar (Smart Pantry Match)
            </p>
            <p className="text-rose-700">
              Resipi di bawah disemak secara automatik mengikut bahan yang ada dalam stok dapur anda sekarang!
            </p>
          </div>

          <div className="space-y-3">
            {SAMPLE_RECIPES.map((recipe) => {
              const match = getRecipeMatchInfo(recipe);

              return (
                <div
                  key={recipe.id}
                  className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl shadow-inner">
                        {recipe.imageEmoji}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-base">{recipe.name}</h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-rose-500" />
                            {recipe.prepTime}
                          </span>
                          <span>•</span>
                          <span>{recipe.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Match Badge */}
                    {match.isFullMatch ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Bahan Cukup! (100%)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold">
                        Stok {match.matchCount}/{match.total} Bahan
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2">{recipe.description}</p>

                  {/* Ingredients Checklist Preview */}
                  <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 space-y-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Semakan Bahan Stok:
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {match.ingredientDetails.map((ing, idx) => (
                        <span
                          key={idx}
                          className={`text-[11px] px-2 py-0.5 rounded-lg border font-semibold flex items-center gap-1 ${
                            ing.isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {ing.isAvailable ? '✓' : '✗'} {ing.name} ({ing.requiredQty})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => setActiveRecipe(recipe)}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 flex items-center gap-1 transition"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Lihat Cara Masak
                    </button>

                    <button
                      onClick={() => handleAssignRecipeToDay(recipe.name, 'tengahHari')}
                      className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      + Tambah ke Menu
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BATCH PREP CHECKLIST */}
      {subTab === 'batch' && (
        <div className="space-y-4">
          {/* Progress Card */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-3xl p-4 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base flex items-center gap-1.5">
                  <PackageCheck className="w-5 h-5" />
                  Persediaan Hujung Minggu (Batch Prep)
                </h4>
                <p className="text-xs text-rose-100">Kopek, potong & perap untuk memudahkan sepanjang minggu!</p>
              </div>
              <span className="text-xl font-black bg-white/20 px-3 py-1 rounded-2xl backdrop-blur-md">
                {prepProgressPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-white/30 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-white rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${prepProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Add custom batch prep item */}
          <form onSubmit={handleAddBatchTask} className="flex space-x-2">
            <input
              type="text"
              placeholder="Tambah tugasan prep baru (e.g. Kopek Halia)..."
              value={newBatchTask}
              onChange={(e) => setNewBatchTask(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-white border border-rose-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-800"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs shadow-sm transition"
            >
              Tambah
            </button>
          </form>

          {/* Batch Prep List */}
          <div className="space-y-2">
            {batchPrep.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleBatchItem(item.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start justify-between ${
                  item.completed
                    ? 'bg-emerald-50/70 border-emerald-200 text-gray-500'
                    : 'bg-white border-rose-100 shadow-sm hover:border-rose-300 text-gray-800'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 transition ${
                      item.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-rose-300 bg-white'
                    }`}
                  >
                    {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.task}
                    </p>
                    <span className="text-[10px] text-gray-400 font-medium">{item.category}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBatchTask(item.id);
                  }}
                  className="text-gray-300 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Day Meal Modal */}
      {isEditDayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="font-bold text-lg text-gray-800">Kemaskini Menu Hari {selectedDay}</h3>
              <button onClick={() => setIsEditDayModalOpen(false)} className="text-gray-400 hover:text-rose-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDayPlan} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sarapan Pagi</label>
                <input
                  type="text"
                  value={editSarapan}
                  onChange={(e) => setEditSarapan(e.target.value)}
                  placeholder="e.g. Nasi Goreng Kampung"
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Makan Tengah Hari</label>
                <input
                  type="text"
                  value={editTengahHari}
                  onChange={(e) => setEditTengahHari(e.target.value)}
                  placeholder="e.g. Ayam Masak Merah & Ulam"
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Makan Malam</label>
                <input
                  type="text"
                  value={editMalam}
                  onChange={(e) => setEditMalam(e.target.value)}
                  placeholder="e.g. Sup Daging & Telur Dadar"
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-800"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditDayModalOpen(false)}
                  className="w-1/2 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recipe Recipe View Modal */}
      {activeRecipe && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl border border-rose-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">{activeRecipe.imageEmoji}</span>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{activeRecipe.name}</h3>
                  <span className="text-xs text-rose-600 font-semibold">{activeRecipe.prepTime} • {activeRecipe.category}</span>
                </div>
              </div>
              <button onClick={() => setActiveRecipe(null)} className="text-gray-400 hover:text-rose-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ingredients */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Bahan-Bahan Diperlukan:</h4>
              <ul className="space-y-1 bg-rose-50/60 p-3 rounded-2xl border border-rose-100 text-xs font-medium text-gray-700">
                {activeRecipe.requiredIngredients.map((ing, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span>• {ing.name}</span>
                    <span className="font-bold text-rose-600">{ing.requiredQty}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Langkah Menyediakan:</h4>
              <ol className="space-y-2 text-xs text-gray-700">
                {activeRecipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start space-x-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <button
              onClick={() => setActiveRecipe(null)}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm shadow-md"
            >
              Tutup Resipi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
