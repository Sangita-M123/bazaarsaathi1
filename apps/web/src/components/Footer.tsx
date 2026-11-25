import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-white py-8 text-xs text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <p className="font-semibold text-slate-700">
          BazaarSaathi — Voice-First Shopping • Virtual Try-On • Gullak Wallet • Seller RAG Help
        </p>
        <div className="flex flex-wrap gap-4 font-medium">
          <Link href="/" className="hover:text-orange-600">Store</Link>
          <Link href="/gullak" className="hover:text-orange-600">Gullak Wallet</Link>
          <Link href="/orders" className="hover:text-orange-600">Orders</Link>
          <Link href="/support" className="hover:text-orange-600">Seller Help</Link>
          <Link href="/seller" className="hover:text-orange-600">Seller Desk</Link>
        </div>
      </div>
    </footer>
  );
}