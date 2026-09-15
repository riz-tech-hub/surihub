'use client';

import React, { useState, useMemo } from 'react';
import { PantryItem, CategoryType, PresetIngredient } from '@/types';
import { PRESET_INGREDIENTS } from '@/data/mockData';
import { getExpiryStatus, getDaysUntilExpiry, getFutureDateStr } from '@/utils/helpers';
import { Plus, Search, Filter, AlertTriangle, CheckCircle2, Trash2, Edit3, Minus, Calendar, ShoppingBag, Sparkles, X } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  addPantryItemToSupabase,
  updatePantryItemInSupabase,
  deletePantryItemFromSupabase,
} from '@/lib/supabaseService';

interface PantryTrackerProps {
  items: PantryItem[];
  setItems: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  currentUser?: SupabaseUser | null;
}

export const PantryTracker: React.FC<PantryTrackerProps> = ({ items, setItems, currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [filterExpiryAlertOnly, setFilterExpiryAlertOnly] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryType>('Bahan Basah');
  const [formQuantity, setFormQuantity] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState(getFutureDateStr(7));
  const [formNotes, setFormNotes] = useState('');

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Bahan Basah');
    setFormQuantity('1 unit');
    setFormExpiryDate(getFutureDateStr(7));
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (item: PantryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormQuantity(item.quantity);
    setFormExpiryDate(item.expiryDate);
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  // Preset 1-tap add
  const handleAddPreset = async (preset: PresetIngredient) => {
    const itemData = {
      name: preset.name,
      category: preset.category,
      quantity: preset.defaultQuantity,
      expiryDate: getFutureDateStr(preset.defaultDaysToExpiry),
      addedDate: new Date().toISOString().split('T')[0],
    };

    if (currentUser) {
      const inserted = await addPantryItemToSupabase(currentUser.id, itemData);
      if (inserted) {
        setItems((prev) => [inserted, ...prev]);
        return;
      }
    }

    const newItem: PantryItem = {
      id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...itemData,
    };
    setItems((prev) => [newItem, ...prev]);
  };

  // Save item (add or edit)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingItem) {
      const updates = {
        name: formName.trim(),
        category: formCategory,
        quantity: formQuantity.trim() || '1 unit',
        expiryDate: formExpiryDate,
        notes: formNotes.trim(),
      };

      if (currentUser) {
        await updatePantryItemInSupabase(editingItem.id, updates);
      }

      setItems((prev) =>
        prev.map((item) => (item.id === editingItem.id ? { ...item, ...updates } : item))
      );
    } else {
      const itemData = {
        name: formName.trim(),
        category: formCategory,
        quantity: formQuantity.trim() || '1 unit',
        expiryDate: formExpiryDate,
        addedDate: new Date().toISOString().split('T')[0],
        notes: formNotes.trim(),
      };

      if (currentUser) {
        const inserted = await addPantryItemToSupabase(currentUser.id, itemData);
        if (inserted) {
          setItems((prev) => [inserted, ...prev]);
          setIsModalOpen(false);
          return;
        }
      }

      const newItem: PantryItem = {
        id: `pantry-${Date.now()}`,
        ...itemData,
      };
      setItems((prev) => [newItem, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    if (confirm('Adakah anda pasti ingin memadamkan bahan ini dari stok dapur?')) {
      if (currentUser) {
        await deletePantryItemFromSupabase(id);
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Quick use item
  const handleUseItem = async (id: string) => {
    if (currentUser) {
      await deletePantryItemFromSupabase(id);
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Statistics
  const stats = useMemo(() => {
    let redCount = 0;
    let yellowCount = 0;
    let greenCount = 0;

    items.forEach((item) => {
      const days = getDaysUntilExpiry(item.expiryDate);
      if (days <= 2) redCount++;
      else if (days <= 5) yellowCount++;
      else greenCount++;
    });

    return { total: items.length, redCount, yellowCount, greenCount };
  }, [items]);

  // Filtered items list sorted by expiry date ascending
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
        const days = getDaysUntilExpiry(item.expiryDate);
        const matchesExpiryFilter = !filterExpiryAlertOnly || days <= 5;
        return matchesSearch && matchesCategory && matchesExpiryFilter;
      })
      .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate));
  }, [items, searchQuery, selectedCategory, filterExpiryAlertOnly]);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner & Quick Stat Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-3 border border-rose-100 shadow-sm flex flex-col items-center text-center">
          <span className="text-xs font-semibold text-gray-500">Jumlah Stok</span>
          <span className="text-xl font-bold text-gray-800">{stats.total}</span>
        </div>
        <button
          onClick={() => setFilterExpiryAlertOnly(!filterExpiryAlertOnly)}
          className={`rounded-2xl p-3 border shadow-sm flex flex-col items-center text-center transition ${
            filterExpiryAlertOnly || stats.redCount > 0
              ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
              : 'bg-white border-rose-100 text-gray-700'
          }`}
        >
          <span className="text-xs font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Hampir Luput
          </span>
          <span className="text-xl font-bold text-rose-600">{stats.redCount + stats.yellowCount}</span>
        </button>
        <div className="bg-white rounded-2xl p-3 border border-rose-100 shadow-sm flex flex-col items-center text-center">
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Segar
          </span>
          <span className="text-xl font-bold text-emerald-700">{stats.greenCount}</span>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="bg-white rounded-2xl p-3 border border-rose-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-rose-500" />
            Tambah Pantas (Presets Tempatan)
          </span>
          <span className="text-[11px] text-gray-400">1-Tap Masuk Stok</span>
        </div>
        <div className="flex overflow-x-auto space-x-2 py-1 scrollbar-none">
          {PRESET_INGREDIENTS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleAddPreset(preset)}
              className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-medium border border-rose-200/60 transition active:scale-95"
            >
              <span>{preset.emoji}</span>
              <span>{preset.name}</span>
              <Plus className="w-3 h-3 text-rose-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari bahan dapur (e.g. Ayam, Bawang, Santan)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-rose-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-sm text-gray-800"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex space-x-1.5 overflow-x-auto py-1 scrollbar-none">
          {['Semua', 'Bahan Basah', 'Bahan Kering', 'Pes/Rempah'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add New Item Button */}
      <button
        onClick={handleOpenAdd}
        className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition active:scale-98"
      >
        <Plus className="w-5 h-5" />
        <span>Tambah Bahan Baru ke Dapur</span>
      </button>

      {/* Item List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-rose-200 text-gray-500 space-y-2">
            <ShoppingBag className="w-10 h-10 text-rose-300 mx-auto" />
            <p className="font-semibold text-gray-700">Tiada bahan dijumpai</p>
            <p className="text-xs text-gray-400">Gunakan butang Tambah Pantas di atas atau buat rekod bahan baru.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const expiryInfo = getExpiryStatus(item.expiryDate);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3.5 border border-rose-100 shadow-sm hover:shadow-md transition space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-800 text-base">{item.name}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium border border-gray-200">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        Kuantiti: {item.quantity}
                      </span>
                      {item.notes && <span className="italic text-gray-400">"{item.notes}"</span>}
                    </div>
                  </div>

                  {/* Expiry Badge */}
                  <span className={`text-xs px-2.5 py-1 rounded-xl border flex items-center gap-1 ${expiryInfo.badgeBg}`}>
                    <span className={`w-2 h-2 rounded-full ${expiryInfo.dotColor}`} />
                    {expiryInfo.label}
                  </span>
                </div>

                {/* Bottom Row Actions */}
                <div className="pt-2 border-t border-rose-50 flex items-center justify-between">
                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Tarikh Luput: {item.expiryDate}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleUseItem(item.id)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition"
                      title="Telah Habis Diguna"
                    >
                      ✓ Habis Guna
                    </button>

                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Edit Item"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Padam Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl border border-rose-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-500" />
                {editingItem ? 'Kemaskini Bahan Dapur' : 'Tambah Bahan Dapur Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Bahan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayam Segar, Bawang Merah, Santan"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2.5 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-800 bg-white"
                  >
                    <option value="Bahan Basah">Bahan Basah</option>
                    <option value="Bahan Kering">Bahan Kering</option>
                    <option value="Pes/Rempah">Pes / Rempah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kuantiti</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500g, 1 ekor, 2 peket"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tarikh Luput (Expiry Date)</label>
                <input
                  type="date"
                  required
                  value={formExpiryDate}
                  onChange={(e) => setFormExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nota Tambahan (Pilihan)</label>
                <input
                  type="text"
                  placeholder="e.g. Simpan dalam freezer, dibeli di Mydin"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-800"
                />
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
