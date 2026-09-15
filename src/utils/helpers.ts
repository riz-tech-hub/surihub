export function getDaysUntilExpiry(expiryDateStr: string): number {
  if (!expiryDateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getExpiryStatus(expiryDateStr: string) {
  const days = getDaysUntilExpiry(expiryDateStr);
  
  if (days < 0) {
    return {
      status: 'danger' as const,
      label: `Telah Luput (${Math.abs(days)} hari lalu)`,
      badgeBg: 'bg-rose-100 border-rose-300 text-rose-700 font-bold',
      dotColor: 'bg-rose-600',
      daysLeft: days
    };
  } else if (days <= 2) {
    return {
      status: 'danger' as const,
      label: days === 0 ? 'Luput HARI INI!' : days === 1 ? 'Luput Besok (1 Hari lagi)' : 'Segera Guna! (2 Hari lagi)',
      badgeBg: 'bg-rose-100 border-rose-300 text-rose-700 font-bold animate-pulse',
      dotColor: 'bg-rose-600',
      daysLeft: days
    };
  } else if (days <= 5) {
    return {
      status: 'warning' as const,
      label: `Luput ${days} hari lagi`,
      badgeBg: 'bg-amber-100 border-amber-300 text-amber-800 font-semibold',
      dotColor: 'bg-amber-500',
      daysLeft: days
    };
  } else {
    return {
      status: 'fresh' as const,
      label: `Segar (${days} hari lagi)`,
      badgeBg: 'bg-emerald-100 border-emerald-300 text-emerald-800 font-medium',
      dotColor: 'bg-emerald-500',
      daysLeft: days
    };
  }
}

export function formatMalayDate(date: Date = new Date()): string {
  const daysMalay = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
  const monthsMalay = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogos', 'Sep', 'Okt', 'Nov', 'Dis'];
  
  const dayName = daysMalay[date.getDay()];
  const dayNum = date.getDate();
  const monthName = monthsMalay[date.getMonth()];
  const year = date.getFullYear();
  
  return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

export function getFutureDateStr(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}
