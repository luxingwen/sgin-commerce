import { AddCart } from 'components/cart/AddCart';
import Price from 'components/price';
import Prose from 'components/prose';
import { Product } from 'lib/shopify/types';
import ProductVariantsSelector from './ProductVariantsSelector';

export function ProductDescription({ product }: { product: Product }) {
  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-5xl font-medium">{product.name}</h1>
        <div className="mr-auto w-auto rounded-full bg-blue-600 p-2 text-sm text-white">
          <Price
            amount={product.price}
          />
        </div>
      </div>
      {/* <VariantSelector options={product.product_variants} variants={product.product_variants_option} /> */}
      <ProductVariantsSelector variants={product.product_variants} options={product.product_variants_option} />
      {product.descriptionHtml ? (
        <Prose
          className="mb-6 text-sm leading-tight dark:text-white/[60%]"
          html={product.descriptionHtml}
        />
      ) : null}
      <AddCart product={product} />
      {/* <AddToCart product={product} /> */}
    </>
  );
}
