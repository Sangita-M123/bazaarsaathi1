import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <p className="mt-2 text-sm text-slate-600">Ye page dukaan me nahi mila!</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-bold text-white"
      >
        Back to Storefront
      </Link>
    </div>
  );
}