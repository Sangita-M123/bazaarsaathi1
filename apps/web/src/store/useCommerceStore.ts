import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, SavingsGoal, SupportTicket, WalletTx } from '@/types';

interface OrderRecord {
  id: string;
  items: { title: string; qty: number; price: number; size: string; sellerName: string }[];
  total: number;
  paymentMethod: 'GULLAK' | 'UPI_TEST';
  placedAt: string;
}

interface CommerceState {
  availableBalance: number;
  lockedBalance: number;
  goals: SavingsGoal[];
  transactions: WalletTx[];
  orders: OrderRecord[];
  tickets: SupportTicket[];

  depositMoney: (amount: number, note?: string) => void;
  withdrawMoney: (amount: number) => { ok: boolean; message: string };
  createGoal: (title: string, targetAmount: number) => void;
  lockIntoGoal: (goalId: string, amount: number) => { ok: boolean; message: string };
  unlockFromGoal: (goalId: string) => void;

  recordOrder: (
    items: OrderRecord['items'],
    total: number,
    paymentMethod: 'GULLAK' | 'UPI_TEST'
  ) => { ok: boolean; message: string; orderId?: string };

  openOrCreateSellerTicket: (product: Product) => string;
  addTicketMessage: (
    ticketId: string,
    sender: 'CUSTOMER' | 'SELLER_AI' | 'SELLER_HUMAN' | 'PLATFORM_ADMIN',
    text: string
  ) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
}

export const useCommerceStore = create<CommerceState>()(
  persist(
    (set, get) => ({
      availableBalance: 3500,
      lockedBalance: 15000,
      goals: [
        { id: 'g1', title: 'Diwali Smart TV Fund', targetAmount: 24999, savedAmount: 15000 },
        { id: 'g2', title: 'Festive Kurta & Saree Pot', targetAmount: 4000, savedAmount: 0 },
      ],
      transactions: [
        {
          id: 'tx-init-1',
          type: 'DEPOSIT',
          amount: 18500,
          note: 'Added from UPI (Demo Bank)',
          timestamp: 'Initial Seed',
        },
        {
          id: 'tx-init-2',
          type: 'GOAL_LOCK',
          amount: 15000,
          note: 'Locked in Diwali Smart TV Fund',
          timestamp: 'Initial Seed',
        },
      ],
      orders: [],
      tickets: [
        {
          id: 'tkt-tv-1',
          sellerId: 's3',
          sellerName: 'TechBharat Electronics',
          productTitle: 'VisionPro 43-inch 4K Ultra HD Smart LED TV',
          status: 'AI_HANDLING',
          messages: [
            {
              sender: 'SELLER_AI',
              text: 'Namaste! Main TechBharat Electronics ka dedicated AI engineer hoon. Aapke VisionPro 43" Smart TV ke warranty, installation, ya display issue me bataiye kya madad karoon?',
              time: '10:30 AM',
            },
          ],
        },
      ],

      depositMoney: (amount, note = 'Added to Shopping Gullak (UPI Test)') =>
        set((s) => ({
          availableBalance: s.availableBalance + amount,
          transactions: [
            {
              id: `tx-${Date.now()}`,
              type: 'DEPOSIT',
              amount,
              note,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...s.transactions,
          ],
        })),

      withdrawMoney: (amount) => {
        const s = get();
        if (amount <= 0 || amount > s.availableBalance) {
          return { ok: false, message: 'Insufficient available Gullak balance.' };
        }
        set({
          availableBalance: s.availableBalance - amount,
          transactions: [
            {
              id: `tx-${Date.now()}`,
              type: 'WITHDRAW',
              amount,
              note: 'Withdrawn back to Source Bank Account (Demo)',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...s.transactions,
          ],
        });
        return { ok: true, message: `₹${amount.toLocaleString('en-IN')} returned to source account!` };
      },

      createGoal: (title, targetAmount) =>
        set((s) => ({
          goals: [...s.goals, { id: `g-${Date.now()}`, title, targetAmount, savedAmount: 0 }],
        })),

      lockIntoGoal: (goalId, amount) => {
        const s = get();
        if (amount <= 0 || amount > s.availableBalance) {
          return { ok: false, message: 'Available Gullak balance kam hai. Pehle paise add karein!' };
        }
        set({
          availableBalance: s.availableBalance - amount,
          lockedBalance: s.lockedBalance + amount,
          goals: s.goals.map((g) =>
            g.id === goalId ? { ...g, savedAmount: g.savedAmount + amount } : g
          ),
          transactions: [
            {
              id: `tx-${Date.now()}`,
              type: 'GOAL_LOCK',
              amount,
              note: 'Ring-fenced into Shopping Goal',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...s.transactions,
          ],
        });
        return { ok: true, message: 'Amount safely locked in your Shopping Goal!' };
      },

      unlockFromGoal: (goalId) => {
        const s = get();
        const goal = s.goals.find((g) => g.id === goalId);
        if (!goal || goal.savedAmount <= 0) return;
        set({
          availableBalance: s.availableBalance + goal.savedAmount,
          lockedBalance: Math.max(0, s.lockedBalance - goal.savedAmount),
          goals: s.goals.map((g) => (g.id === goalId ? { ...g, savedAmount: 0 } : g)),
          transactions: [
            {
              id: `tx-${Date.now()}`,
              type: 'GOAL_UNLOCK',
              amount: goal.savedAmount,
              note: `Unlocked from "${goal.title}" to spendable balance`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...s.transactions,
          ],
        });
      },

      recordOrder: (items, total, paymentMethod) => {
        const s = get();
        if (paymentMethod === 'GULLAK' && s.availableBalance < total) {
          return {
            ok: false,
            message: `Spendable Gullak balance ₹${s.availableBalance} hai. ₹${total} chahiye (ya Goal unlock karein).`,
          };
        }

        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        set({
          availableBalance:
            paymentMethod === 'GULLAK' ? s.availableBalance - total : s.availableBalance,
          orders: [
            {
              id: orderId,
              items,
              total,
              paymentMethod,
              placedAt: new Date().toLocaleString(),
            },
            ...s.orders,
          ],
          transactions:
            paymentMethod === 'GULLAK'
              ? [
                  {
                    id: `tx-${Date.now()}`,
                    type: 'ORDER_DEBIT',
                    amount: total,
                    note: `Order #${orderId} paid via Gullak`,
                    timestamp: new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  },
                  ...s.transactions,
                ]
              : s.transactions,
        });

        return { ok: true, message: `Order #${orderId} confirmed!`, orderId };
      },

      openOrCreateSellerTicket: (product) => {
        const s = get();
        const existing = s.tickets.find((t) => t.sellerId === product.sellerId);
        if (existing) return existing.id;

        const id = `tkt-${Date.now()}`;
        const newTicket: SupportTicket = {
          id,
          sellerId: product.sellerId,
          sellerName: product.sellerName,
          productTitle: product.title,
          status: 'AI_HANDLING',
          messages: [
            {
              sender: 'SELLER_AI',
              text: `Namaste! Main ${product.sellerName} ka dedicated AI assistant hoon (${product.sellerPersona}). "${product.title}" ke baare me koi bhi sawaal ya issue batayein!`,
              time: 'Just now',
            },
          ],
        };
        set({ tickets: [newTicket, ...s.tickets] });
        return id;
      },

      addTicketMessage: (ticketId, sender, text) =>
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  messages: [
                    ...t.messages,
                    {
                      sender,
                      text,
                      time: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    },
                  ],
                }
              : t
          ),
        })),

      updateTicketStatus: (ticketId, status) =>
        set((s) => ({
          tickets: s.tickets.map((t) => (t.id === ticketId ? { ...t, status } : t)),
        })),
    }),
    { name: 'bazaarsaathi-commerce-storage' }
  )
);