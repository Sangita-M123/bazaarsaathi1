'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, setAccessToken } from '@/lib/api-client';
import { useUiStore } from '@/store/useUiStore';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUiStore();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER');
  const [shopName, setShopName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? { name, email, password, role, shopName: role === 'SELLER' ? shopName : undefined } : { email, password };
      const res = await apiFetch<{ data: { user: any; accessToken: string } }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
      router.push('/');
    } catch (err: any) {
      // Allow preview login if backend isn't started yet
      if (err.message.includes('Failed to fetch')) {
        setUser({ id: 'preview-1', name: name || 'Sangita', email: email || 'user@bazaarsaathi.in', role });
        router.push('/');
        return;
      }
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">
          {isRegister ? 'Create BazaarSaathi Account' : 'Welcome Back'}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Sign in with Argon2-secured JWT + HttpOnly Refresh Rotation
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
              />
              <div className="flex gap-2">
                {(['CUSTOMER', 'SELLER'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 rounded-xl border py-2 text-xs font-bold ${
                      role === r ? 'border-orange-600 bg-orange-50 text-orange-700' : 'text-slate-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {role === 'SELLER' && (
                <input
                  type="text"
                  required
                  placeholder="Your Shop Name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
                />
              )}
            </>
          )}
          <input
            type="email"
            required
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
          />
          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-orange-600 py-3 text-sm font-bold text-white hover:bg-orange-700"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => setIsRegister(!isRegister)}
          className="mt-4 w-full text-center text-xs font-semibold text-slate-600 hover:text-orange-600"
        >
          {isRegister ? 'Already have an account? Sign In' : 'New here? Create an Account'}
        </button>
      </div>
    </div>
  );
}