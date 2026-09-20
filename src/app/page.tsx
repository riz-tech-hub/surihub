'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/context/AuthContext';
import { PantryItem, PantryHistoryLog, MealPlanDay, BatchPrepItem, CleaningTask } from '@/types';
import {
  INITIAL_PANTRY_ITEMS,
  INITIAL_PANTRY_HISTORY,
  INITIAL_MEAL_PLAN,
  INITIAL_BATCH_PREP,
  INITIAL_CLEANING_TASKS,
} from '@/data/mockData';
import { Header } from '@/components/Header';
import { GuestWarningBanner } from '@/components/GuestWarningBanner';
import { GuestTeaserDrawer } from '@/components/GuestTeaserDrawer';
import { Navbar, TabType } from '@/components/Navbar';
import { PantryTracker } from '@/components/PantryTracker';
import { MealPlanner } from '@/components/MealPlanner';
import { ZoneCleaner } from '@/components/ZoneCleaner';
import { QuickTaskModal } from '@/components/QuickTaskModal';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { AuthModal } from '@/components/AuthModal';
import {
  fetchPantryItemsFromSupabase,
  fetchMealPlansFromSupabase,
  fetchCleaningTasksFromSupabase,
  fetchPantryHistoryFromSupabase,
} from '@/lib/supabaseService';
import { getDaysUntilExpiry } from '@/utils/helpers';
import { RefreshCw, Database, CloudCheck } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dapur');
  const [syncingCloud, setSyncingCloud] = useState(false);

  const { user, openAuthModal, logout } = useAuth();

  // Persistent storage state (Local / Offline fallback)
  const [pantryItems, setPantryItems, isPantryLoaded] = useLocalStorage<PantryItem[]>(
    'surihub_pantry_items',
    INITIAL_PANTRY_ITEMS
  );

  const [pantryHistoryLogs, setPantryHistoryLogs, isHistoryLoaded] = useLocalStorage<PantryHistoryLog[]>(
    'surihub_pantry_history',
    INITIAL_PANTRY_HISTORY
  );

  const [mealPlan, setMealPlan, isMealLoaded] = useLocalStorage<MealPlanDay[]>(
    'surihub_meal_plan',
    INITIAL_MEAL_PLAN
  );

  const [batchPrep, setBatchPrep, isBatchLoaded] = useLocalStorage<BatchPrepItem[]>(
    'surihub_batch_prep',
    INITIAL_BATCH_PREP
  );

  const [cleaningTasks, setCleaningTasks, isCleaningLoaded] = useLocalStorage<CleaningTask[]>(
    'surihub_cleaning_tasks',
    INITIAL_CLEANING_TASKS
  );

  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [pwaPromptFn, setPwaPromptFn] = useState<(() => void) | null>(null);

  // Sync with Supabase on user authentication
  useEffect(() => {
    if (user) {
      syncFromSupabase(user.id);
    }
  }, [user]);

  // Fetch data from Supabase once logged in
  const syncFromSupabase = async (userId: string) => {
    setSyncingCloud(true);
    try {
      const cloudPantry = await fetchPantryItemsFromSupabase(userId);
      if (cloudPantry && cloudPantry.length > 0) {
        setPantryItems(cloudPantry);
      }

      const cloudHistory = await fetchPantryHistoryFromSupabase(userId);
      if (cloudHistory && cloudHistory.length > 0) {
        setPantryHistoryLogs(cloudHistory);
      }

      const cloudMeals = await fetchMealPlansFromSupabase(userId);
      if (cloudMeals && cloudMeals.length > 0) {
        setMealPlan((prev) =>
          prev.map((day) => {
            const found = cloudMeals.find((m) => m.day === day.day);
            return found ? { ...day, sarapan: found.sarapan, makanTengahHari: found.makanTengahHari } : day;
          })
        );
      }

      const cloudTasks = await fetchCleaningTasksFromSupabase(userId);
      if (cloudTasks && cloudTasks.length > 0) {
        setCleaningTasks(cloudTasks);
      }
    } catch (err) {
      console.error('Error syncing from Supabase:', err);
    } finally {
      setSyncingCloud(false);
    }
  };

  // Near expiry count calculation (<= 5 days)
  const nearExpiryCount = pantryItems.filter((item) => getDaysUntilExpiry(item.expiryDate) <= 5).length;

  // Today's lunch meal summary for header widget
  const todayLunchMeal = mealPlan.find((m) => m.day === 'Isnin')?.makanTengahHari || 'Ayam Masak Merah';

  // Cleaning tasks stats for header
  const completedCleaningCount = cleaningTasks.filter((t) => t.completed).length;
  const totalCleaningCount = cleaningTasks.length;

  const handleResetAllData = () => {
    if (confirm('Adakah anda pasti ingin menetapkan semula semua data app ke sampel asal (Default Mock Data)?')) {
      setPantryItems(INITIAL_PANTRY_ITEMS);
      setPantryHistoryLogs(INITIAL_PANTRY_HISTORY);
      setMealPlan(INITIAL_MEAL_PLAN);
      setBatchPrep(INITIAL_BATCH_PREP);
      setCleaningTasks(INITIAL_CLEANING_TASKS);
    }
  };

  const isDataLoading = !isPantryLoaded || !isHistoryLoaded || !isMealLoaded || !isBatchLoaded || !isCleaningLoaded;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-pink-50/20 to-white text-gray-800 flex flex-col font-sans">
      {/* Header */}
      <Header
        nearExpiryCount={nearExpiryCount}
        completedTasksCount={completedCleaningCount}
        totalTasksCount={totalCleaningCount}
        todayMealSummary={todayLunchMeal}
        canInstall={canInstallPWA}
        onInstallClick={() => pwaPromptFn && pwaPromptFn()}
        currentUser={user}
        onOpenAuth={() => openAuthModal('login')}
        onSignOut={logout}
      />

      {/* Sticky Guest Warning Banner right under Header */}
      <GuestWarningBanner />

      {/* PWA Installation Banner */}
      <PWAInstallPrompt
        onInstallReady={(canInstall, triggerFn) => {
          setCanInstallPWA(canInstall);
          setPwaPromptFn(() => triggerFn);
        }}
      />

      {/* Cloud Sync Status Indicator Bar */}
      <div className="max-w-md mx-auto w-full px-4 pt-2">
        <div className="bg-white/80 backdrop-blur-xs rounded-xl p-2.5 border border-rose-100 shadow-xs flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-gray-600">
            <Database className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-semibold">
              {user ? `Disambung: ${user.email}` : 'Mod Tetamu (Local Storage)'}
            </span>
          </div>

          {syncingCloud ? (
            <span className="text-[10px] text-rose-500 animate-pulse font-bold">Menyegar Cloud...</span>
          ) : user ? (
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <CloudCheck className="w-3 h-3" />
              Cloud Sync Active
            </span>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="text-[10px] text-rose-600 font-bold bg-rose-50 hover:bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200 transition"
            >
              Sign In Now
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-3 pb-24">
        {isDataLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-rose-600 font-bold">Memuatkan SuriHub...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dapur' && (
              <PantryTracker
                items={pantryItems}
                setItems={setPantryItems}
                historyLogs={pantryHistoryLogs}
                setHistoryLogs={setPantryHistoryLogs}
                currentUser={user}
              />
            )}

            {activeTab === 'menu' && (
              <MealPlanner
                pantryItems={pantryItems}
                mealPlan={mealPlan}
                setMealPlan={setMealPlan}
                batchPrep={batchPrep}
                setBatchPrep={setBatchPrep}
                setPantryItems={setPantryItems}
                currentUser={user}
              />
            )}

            {activeTab === 'kemas' && (
              <ZoneCleaner
                tasks={cleaningTasks}
                setTasks={setCleaningTasks}
                currentUser={user}
              />
            )}

            {/* Footer helper links & reset */}
            <div className="pt-6 pb-2 text-center border-t border-rose-100 space-y-2">
              <button
                onClick={handleResetAllData}
                className="text-[11px] text-gray-400 hover:text-rose-600 underline inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Set Semula Data Contoh (Reset Demo Data)
              </button>
              <p className="text-[10px] text-gray-400">
                SuriHub v1.0 • Pantry Audit Log & Cloud Backup 💕
              </p>
            </div>
          </>
        )}
      </main>

      {/* Floating 5-Min Task FAB & Modal */}
      <QuickTaskModal />

      {/* Auth Modal & Guest Teaser Drawer */}
      <AuthModal />
      <GuestTeaserDrawer />

      {/* Bottom Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        nearExpiryBadge={nearExpiryCount}
      />
    </div>
  );
}
