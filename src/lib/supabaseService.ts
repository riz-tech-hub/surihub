import { supabase, isSupabaseConfigured } from './supabaseClient';
import { PantryItem, MealPlanDay, CleaningTask, CategoryType, ZoneType } from '@/types';

// ==========================================
// 1. SMART PANTRY CRUD
// ==========================================

export async function fetchPantryItemsFromSupabase(userId: string): Promise<PantryItem[] | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pantry items:', error);
    return null;
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category as CategoryType,
    quantity: row.quantity,
    expiryDate: row.expiry_date,
    addedDate: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    notes: row.notes || '',
  }));
}

export async function addPantryItemToSupabase(userId: string, item: Omit<PantryItem, 'id'>): Promise<PantryItem | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('pantry_items')
    .insert([
      {
        user_id: userId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        expiry_date: item.expiryDate,
        notes: item.notes || '',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding pantry item:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    category: data.category as CategoryType,
    quantity: data.quantity,
    expiryDate: data.expiry_date,
    addedDate: data.created_at ? data.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    notes: data.notes || '',
  };
}

export async function updatePantryItemInSupabase(id: string, updates: Partial<PantryItem>): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const dbUpdates: Record<string, any> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
  if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  const { error } = await supabase.from('pantry_items').update(dbUpdates).eq('id', id);

  if (error) {
    console.error('Error updating pantry item:', error);
    return false;
  }
  return true;
}

export async function deletePantryItemFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase.from('pantry_items').delete().eq('id', id);

  if (error) {
    console.error('Error deleting pantry item:', error);
    return false;
  }
  return true;
}

// ==========================================
// 2. MEAL PLANS CRUD
// ==========================================

export async function fetchMealPlansFromSupabase(userId: string): Promise<MealPlanDay[] | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching meal plans:', error);
    return null;
  }

  return data.map((row) => ({
    day: row.day_of_week,
    sarapan: row.recipe_name || '',
    makanTengahHari: row.prep_notes || '',
    makanMalam: '',
  }));
}

export async function saveMealPlanDayToSupabase(userId: string, mealDay: MealPlanDay): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase.from('meal_plans').upsert(
    {
      user_id: userId,
      day_of_week: mealDay.day,
      recipe_name: mealDay.sarapan,
      prep_notes: `${mealDay.makanTengahHari}|||${mealDay.makanMalam}`,
    },
    { onConflict: 'user_id,day_of_week' }
  );

  if (error) {
    console.error('Error saving meal plan:', error);
    return false;
  }
  return true;
}

// ==========================================
// 3. ZONE CLEANING TASKS CRUD
// ==========================================

export async function fetchCleaningTasksFromSupabase(userId: string): Promise<CleaningTask[] | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('cleaning_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching cleaning tasks:', error);
    return null;
  }

  return data.map((row) => ({
    id: row.id,
    title: row.task_name,
    zone: row.zone as ZoneType,
    completed: row.is_done,
    estimatedMinutes: 5,
  }));
}

export async function addCleaningTaskToSupabase(userId: string, task: Omit<CleaningTask, 'id'>): Promise<CleaningTask | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('cleaning_tasks')
    .insert([
      {
        user_id: userId,
        zone: task.zone,
        task_name: task.title,
        is_done: task.completed,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding cleaning task:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.task_name,
    zone: data.zone as ZoneType,
    completed: data.is_done,
    estimatedMinutes: 5,
  };
}

export async function toggleCleaningTaskInSupabase(id: string, isDone: boolean): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase.from('cleaning_tasks').update({ is_done: isDone }).eq('id', id);

  if (error) {
    console.error('Error toggling cleaning task:', error);
    return false;
  }
  return true;
}

export async function deleteCleaningTaskFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase.from('cleaning_tasks').delete().eq('id', id);

  if (error) {
    console.error('Error deleting cleaning task:', error);
    return false;
  }
  return true;
}
