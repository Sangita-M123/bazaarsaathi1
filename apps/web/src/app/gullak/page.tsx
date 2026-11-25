'use client';

import { useState } from 'react';
import { Wallet, PiggyBank, ArrowDownLeft, ArrowUpRight, Lock, Unlock, Plus } from 'lucide-react';
import { useCommerceStore } from '@/store/useCommerceStore';

export default function GullakWalletPage() {
  const {
    availableBalance,
    lockedBalance,
    goals,
    transactions,
    depositMoney,
    withdrawMoney,
    createGoal,
    lockIntoGoal,
    unlockFromGoal,
  } = useCommerceStore();

  const [amountInput, setAmountInput] = useState('1000');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('5000');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleDeposit = () => {
    const val = Number(amountInput);
    if (val > 0) {
      depositMoney(val);
      setFeedback(`₹${val.toLocaleString('en-IN')} added safely to your Shopping Gullak!`);
    }
  };

  const handleWithdraw = () => {
    const res = withdrawMoney(Number(amountInput));
    setFeedback(res.message);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
            <PiggyBank className="h-7 w-7 text-orange-600" /> Shopping Gullak Wallet
          </h1>
          <p className="text-sm text-slate-600">
            Keep shopping money separate from daily bank spending—lock for goals or withdraw back anytime (Demo Ledger Mode).
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          ACID Ledger Simulation • Test Mode
        </span>
      </div>

      {feedback && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {feedback}
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Wallet className="h-4 w-4 text-amber-400" /> Spendable Gullak Balance
          </p>
          <p className="mt-2 text-3xl font-extrabold">₹{availableBalance.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-xs text-slate-400">Ready for checkout or withdrawal to bank</p>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
            <Lock className="h-4 w-4" /> Locked in Shopping Goals
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            ₹{lockedBalance.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs text-amber-700">Protected so it doesn’t get spent accidentally</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-600">Quick Deposit / Withdraw</p>
          <input
            type="number"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-orange-500"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleDeposit}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <ArrowDownLeft className="h-3.5 w-3.5" /> Add Money
            </button>
            <button
              onClick={handleWithdraw}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-300 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowUpRight className="h-3.5 w-3.5" /> Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Shopping Goals + Ledger */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Your Shopping Goals</h2>
          <div className="mt-4 space-y-4">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100));
              return (
                <div key={g.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">{g.title}</p>
                    <span className="text-xs font-bold text-orange-600">{pct}%</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full bg-orange-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      ₹{g.savedAmount.toLocaleString('en-IN')} / ₹{g.targetAmount.toLocaleString('en-IN')}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const r = lockIntoGoal(g.id, 500);
                          setFeedback(r.message);
                        }}
                        className="rounded-lg bg-slate-900 px-2.5 py-1 font-semibold text-white hover:bg-orange-600"
                      >
                        + Lock ₹500
                      </button>
                      {g.savedAmount > 0 && (
                        <button
                          onClick={() => unlockFromGoal(g.id)}
                          className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 font-semibold hover:bg-white"
                        >
                          <Unlock className="h-3 w-3" /> Unlock
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!goalTitle.trim()) return;
              createGoal(goalTitle.trim(), Number(goalTarget) || 5000);
              setGoalTitle('');
            }}
            className="mt-5 flex gap-2 border-t pt-4"
          >
            <input
              type="text"
              placeholder="New Goal (e.g. Mummy ki Saree)"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none focus:border-orange-500"
            />
            <input
              type="number"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
              className="w-24 rounded-xl border px-3 py-2 text-xs outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1 rounded-xl bg-orange-600 px-3 py-2 text-xs font-bold text-white"
            >
              <Plus className="h-4 w-4" /> Goal
            </button>
          </form>
        </div>

        {/* Immutable Ledger */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Gullak Ledger History</h2>
          <div className="mt-4 max-h-96 space-y-2.5 overflow-y-auto">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-800">{tx.note}</p>
                  <p className="text-[11px] text-slate-400">
                    {tx.type} • {tx.timestamp}
                  </p>
                </div>
                <span
                  className={`font-extrabold ${
                    tx.type === 'DEPOSIT' || tx.type === 'GOAL_UNLOCK'
                      ? 'text-emerald-600'
                      : 'text-slate-900'
                  }`}
                >
                  {tx.type === 'DEPOSIT' || tx.type === 'GOAL_UNLOCK' ? '+' : '-'}₹
                  {tx.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}