import Link from "next/link";
import Image from "next/image";
import { sar } from "@/lib/format";

export type ProductRow = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  colors?: string;
};

export default function ProductCard({ product }: { product: ProductRow }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-primary-soft/40">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.stock <= 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-danger-soft px-3 py-1 text-xs font-bold text-danger">
            نفدت الكمية
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-semibold text-muted">{product.category}</span>
        <h3 className="font-bold leading-snug">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-extrabold text-primary tabular">{sar(product.price)}</span>
          <span className="rounded-lg bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
            عرض المنتج
          </span>
        </div>
      </div>
    </Link>
  );
}
