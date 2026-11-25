'use client';

import { CheckCircle2 } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';

export function Toast() {
  const toastMessage = useUiStore((s) => s.toastMessage);
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xl">
      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      <span>{toastMessage}</span>
    </div>
  );
}