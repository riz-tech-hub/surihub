'use client';

import React, { useState, useMemo } from 'react';
import { PantryItem } from '@/types';
import { getDaysUntilExpiry, formatMalayDate } from '@/utils/helpers';
import {
  Printer,
  Share2,
  Copy,
  Check,
  X,
  ShoppingBag,
  AlertTriangle,
  FileText,
  MessageSquare,
  CheckSquare,
  Square,
} from 'lucide-react';

interface PantryPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PantryItem[];
}

export const PantryPrintModal: React.FC<PantryPrintModalProps> = ({ isOpen, onClose, items }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'urgent'>('all');
  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, boolean>>({});
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [customNotes, setCustomNotes] = useState('');

  // Initialize selected items when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const initialMap: Record<string, boolean> = {};
      items.forEach((item) => {
        initialMap[item.id] = true;
      });
      setSelectedItemIds(initialMap);
      setCopiedWhatsApp(false);
    }
  }, [isOpen, items]);

  // Urgent items (days left <= 5)
  const urgentCount = useMemo(() => {
    return items.filter((item) => getDaysUntilExpiry(item.expiryDate) <= 5).length;
  }, [items]);

  // Displayed items based on filter mode and checkbox selection
  const displayedItems = useMemo(() => {
    return items
      .filter((item) => {
        if (filterMode === 'urgent') {
          return getDaysUntilExpiry(item.expiryDate) <= 5;
        }
        return true;
      })
      .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate));
  }, [items, filterMode]);

  // Items checked by user for print/share
  const activeItemsToPrint = useMemo(() => {
    return displayedItems.filter((item) => selectedItemIds[item.id] !== false);
  }, [displayedItems, selectedItemIds]);

  if (!isOpen) return null;

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = displayedItems.every((item) => selectedItemIds[item.id] !== false);
    const updatedMap = { ...selectedItemIds };
    displayedItems.forEach((item) => {
      updatedMap[item.id] = !allSelected;
    });
    setSelectedItemIds(updatedMap);
  };

  // Generate plain text format for WhatsApp / Copying
  const generateWhatsAppText = () => {
    const dateStr = formatMalayDate();
    let text = `🛒 *SENARAI RESTOK DAPUR SURIHUB* 💕\n📅 Tarikh: ${dateStr}\n\n`;

    if (activeItemsToPrint.length === 0) {
      text += `Tiada bahan dipilih untuk dibeli.`;
    } else {
      // Group by category
      const categories = ['Bahan Basah', 'Bahan Kering', 'Pes/Rempah'];
      categories.forEach((cat) => {
        const catItems = activeItemsToPrint.filter((i) => i.category === cat);
        if (catItems.length > 0) {
          text += `📌 *${cat.toUpperCase()}*\n`;
          catItems.forEach((item) => {
            const daysLeft = getDaysUntilExpiry(item.expiryDate);
            const statusTag = daysLeft <= 2 ? ' ⚠️ [Luput Soon]' : '';
            text += `[ ] ${item.name} (${item.quantity}) - ${item.storageType || 'Dapur'}${statusTag}\n`;
          });
          text += `\n`;
        }
      });
    }

    if (customNotes.trim()) {
      text += `📝 *NOTA TAMBAHAN:*\n${customNotes.trim()}\n\n`;
    }

    text += `_Dihantar dari SuriHub PWA ✨_`;
    return text;
  };

  // Handle trigger print
  const handlePrint = () => {
    window.print();
  };

  // Handle Copy to WhatsApp
  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppText();
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  // Handle Native Share API
  const handleNativeShare = async () => {
    const text = generateWhatsAppText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Senarai Restok Dapur SuriHub',
          text: text,
        });
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    } else {
      handleCopyWhatsApp();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      {/* Printable Area styling wrapper */}
      <style flex-grow>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-restock-sheet, #printable-restock-sheet * {
            visibility: visible;
          }
          #printable-restock-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-rose-100 my-auto animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header (Screen only) */}
        <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-500 to-pink-500 text-white no-print">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Cetak & Kongsi Senarai Restok 🛒</h3>
              <p className="text-xs text-rose-100 font-medium">Senarai beli-belah untuk keluarga</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls & Filters (Screen only) */}
        <div className="p-4 bg-rose-50/50 border-b border-rose-100 space-y-3 no-print">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700">Tapis Senarai:</span>
            <button
              onClick={toggleSelectAll}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Pilih Semua / Batal
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => setFilterMode('all')}
              className={`py-2 px-3 rounded-xl border transition flex items-center justify-center space-x-1.5 ${
                filterMode === 'all'
                  ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-rose-50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Semua Stok ({items.length})</span>
            </button>

            <button
              onClick={() => setFilterMode('urgent')}
              className={`py-2 px-3 rounded-xl border transition flex items-center justify-center space-x-1.5 ${
                filterMode === 'urgent'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Luput Soon ({urgentCount})</span>
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Nota Tambahan Pembelian (Opsional):</label>
            <input
              type="text"
              placeholder="e.g. Beli sabun basuh baju & plastik sampah..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-800"
            />
          </div>
        </div>

        {/* Printable Preview Sheet Area */}
        <div
          id="printable-restock-sheet"
          className="p-5 overflow-y-auto flex-1 space-y-4 bg-white text-gray-800"
        >
          {/* Printable Header */}
          <div className="border-b-2 border-gray-800 pb-3 flex justify-between items-end">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                🛒 SENARAI RESTOK DAPUR SURIHUB
              </h2>
              <p className="text-xs text-gray-600 font-medium">Bantu Ahli Keluarga Beli-Belah & Restok Barang Dapur</p>
            </div>
            <div className="text-right text-xs text-gray-500 font-semibold">
              <span>Tarikh: {formatMalayDate()}</span>
            </div>
          </div>

          {/* List Content */}
          {displayedItems.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              Tiada item dalam senarai ini.
            </div>
          ) : (
            <div className="space-y-4">
              {['Bahan Basah', 'Bahan Kering', 'Pes/Rempah'].map((cat) => {
                const catItems = displayedItems.filter((i) => i.category === cat);
                if (catItems.length === 0) return null;

                return (
                  <div key={cat} className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-700 border-b border-rose-200 pb-1 flex items-center justify-between">
                      <span>{cat}</span>
                      <span className="text-[10px] font-normal text-gray-500">({catItems.length} item)</span>
                    </h4>

                    <div className="grid grid-cols-1 gap-1.5">
                      {catItems.map((item) => {
                        const isChecked = selectedItemIds[item.id] !== false;
                        const daysLeft = getDaysUntilExpiry(item.expiryDate);
                        const isUrgent = daysLeft <= 2;

                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleSelectItem(item.id)}
                            className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer select-none transition ${
                              isChecked
                                ? 'bg-rose-50/40 border-rose-200 text-gray-900'
                                : 'bg-gray-50 border-gray-200 opacity-50 line-through text-gray-400'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              {/* Screen check box / Print checkbox square */}
                              <div className="text-rose-600 flex-shrink-0">
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 no-print text-rose-500" />
                                ) : (
                                  <Square className="w-4 h-4 no-print text-gray-400" />
                                )}
                                {/* Print printable checkbox symbol */}
                                <span className="hidden print:inline font-mono font-bold text-sm">
                                  [ &nbsp; ]
                                </span>
                              </div>

                              <div>
                                <span className="font-bold text-gray-800">{item.name}</span>
                                <span className="text-gray-500 text-[11px] ml-2">({item.quantity})</span>
                                {item.storageType && (
                                  <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md ml-2 border border-rose-100">
                                    {item.storageType}
                                  </span>
                                )}
                              </div>
                            </div>

                            {isUrgent && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                                <AlertTriangle className="w-3 h-3" />
                                Hampir Luput
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Custom Notes display */}
              {customNotes.trim() && (
                <div className="pt-2 border-t border-gray-200">
                  <h5 className="text-xs font-bold text-gray-800 mb-1">📝 Nota Tambahan:</h5>
                  <p className="text-xs text-gray-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                    {customNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer on printed sheet */}
          <div className="pt-4 border-t border-gray-300 text-center text-[10px] text-gray-400 font-medium hidden print:block">
            Dicetak daripada SuriHub PWA 💕 • Aplikasi Pengurusan Dapur & Rumah Tangga
          </div>
        </div>

        {/* Modal Action Footer (Screen only) */}
        <div className="p-4 bg-gray-50 border-t border-rose-100 grid grid-cols-2 gap-2 no-print">
          {/* WhatsApp / Native Share button */}
          <button
            onClick={handleNativeShare}
            className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 transition active:scale-95"
          >
            {copiedWhatsApp ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Disalin!</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp / Kongsi</span>
              </>
            )}
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="py-3 px-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
