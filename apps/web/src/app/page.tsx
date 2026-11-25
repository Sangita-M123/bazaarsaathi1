import { Suspense } from 'react';
import { ProductCatalog } from '@/components/ProductCatalog';
import { ProductSkeletonGrid } from '@/components/ProductSkeleton';

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10">
          <ProductSkeletonGrid />
        </div>
      }
    >
      <ProductCatalog />
    </Suspense>
  );
}