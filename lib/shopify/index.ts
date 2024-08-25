import {
  Cart,
  Collection,
  Connection,
  Menu,
  Page,
  Product,
  ShopifyCart
} from './types';

const apiUrl = "http://localhost:8081"; // Make sure to set this environment variable

const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  return array.edges.map((edge) => edge?.node);
};

const reshapeCart = (cart: ShopifyCart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: '0.0',
      currencyCode: 'USD'
    };
  }

  return {
    ...cart,
    lines: removeEdgesAndNodes(cart.lines)
  };
};

const reshapeCollection = (collection: Collection): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/search/${collection.handle}`
  };
};

const reshapeCollections = (collections: Collection[]) => {
  return collections.map(reshapeCollection).filter(Boolean) as Collection[];
};

const reshapeImages = (images) => {
  return images.map((image) => ({
    url: apiUrl+ "/public/" + image,
  }));
};

const reshapeProduct = (product: Product, filterHiddenProducts: boolean = true) => {
  // if (!product || (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))) {
  //   return undefined;
  // }


  console.log("product:", product);

  const { images, ...rest } = product;

  const imageList = reshapeImages(images);

  const featuredImage = imageList.length > 0 ? imageList[0] : null;

  return {
    ...rest,
    images: imageList,
    featuredImage,
  };
};


const reshapeProductItemVariant = (productItemVariant: any) => {

  if (!productItemVariant) {
    return [];
  }

  // variants: '大小:大-颜色:黄色' => [{ name: '大小', value: '大' }, { name: '颜色', value: '黄色' }]
  const selectedOptions = productItemVariant.variants.split('-').map((variant) => {
    const [name, value] = variant.split(':');
    return { name, value };
  });

  return selectedOptions;
};


const reshapeProductItems = (productItems: any) => {
  return productItems.map((productItem) => {
    const { image_list, ...rest } = productItem;

    const imageList = reshapeImages(image_list);

    const featuredImage = imageList.length > 0 ? imageList[0] : null;

    return {
      ...rest,
      images: imageList,
      variants: reshapeProductItemVariant(productItem),
      featuredImage,
    };
  });
};

const reshapeProductInfo = (product: Product) => {
  // if (!product || (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))) {
  //   return undefined;
  // }




  const { images, ...rest } = product;

  const imageList = reshapeImages(images);

  const featuredImage = imageList.length > 0 ? imageList[0] : null;

  return {
    ...rest,
    images: imageList,
    product_items: reshapeProductItems(product.product_items),
    featuredImage,
  };
};

const reshapeProducts = (products: Product[]) => {
  return products.map(reshapeProduct).filter(Boolean) as Product[];
};

async function shopifyFetch(endpoint: string, method: string, data?: any) {

  console.log("endpoint:", endpoint);
  console.log("method:", method);
  console.log("data:", data);
  const response = await fetch(`${apiUrl}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!, // Ensure this environment variable is set
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error: ${response.status} - ${errorData.message}`);
  }

  return response.json();
}

export async function createCart() {
  // const response = await shopifyFetch('/api/carts', 'POST');
  // return reshapeCart(response.data.cart);
  return [];
}

export async function addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]) {
  console.log("addtocard cartId:", cartId);
 // const response = await shopifyFetch(`/api/carts/${cartId}/line_items`, 'POST', { lines });
  return [];
}

export async function removeFromCart(cartId: string, lineIds: string[]) {
  const response = await shopifyFetch(`/api/carts/${cartId}/line_items`, 'POST', { lineIds });
  return reshapeCart(response.data.cart);
}

export async function updateCart(cartId: string, lines: { id: string; merchandiseId: string; quantity: number }[]) {
  const response = await shopifyFetch(`/api/carts/${cartId}/line_items`, 'POST', { lines });
  return reshapeCart(response.data.cart);
}

export async function getCart(cartId: string | undefined): Promise<Cart | undefined> {
  if (!cartId) {
    return undefined;
  }

  return {
    lines: [],
  };

  // const response = await shopifyFetch(`/api/carts/${cartId}`, 'POST', { cartId });

  // if (!response.data.cart) {
  //   return undefined;
  // }

  // return reshapeCart(response.data.cart);
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  console.log("handle:", handle);
  const response = await shopifyFetch(`/api/v1/f/product_category/all`, 'POST', { handle });
  return reshapeCollection(response.data.collection);
}

export async function getCollectionProducts({
  page,
  reverse,
  sortKey
}: {
  page: {
    current: number;
    pageSize: number;
  };
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  console.log("page:", page);
  const response = await shopifyFetch(`/api/v1/f/product/list`, 'POST', {
    ...page,
    reverse,
    sortKey: sortKey === 'CREATED_AT' ? 'CREATED' : sortKey,
  });

  if (!response.data.data) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }

  console.log("response:", response);

  return reshapeProducts(response.data.data);
}

export async function getCollections(): Promise<Collection[]> {
  const response = await shopifyFetch('/api/v1/f/product_category/all', 'POST');
  console.log("response:", response);
  const collections = reshapeCollections(response.data);

  return [
    {
      handle: '',
      title: 'All',
      description: 'All products',
      seo: {
        title: 'All',
        description: 'All products'
      },
      path: '/search',
      updatedAt: new Date().toISOString()
    },
    ...collections
  ];
}


export async function getHeaderNavMenu(handle: string): Promise<Menu[]> {
  return [
    {
      'title': 'All',
      'path': '/search'
    },
    {
      'title': 'shirts',
      'path': '/search/shirts'
    },
    {
      'title': 'Popular',
      'path': '/search/popular'
    },
  ]
}

    

export async function getMenu(handle: string): Promise<Menu[]> {
  // const response = await shopifyFetch(`/api/menus/${handle}`, 'POST', { handle });
  // return response.data.menu.items.map((item: { title: string; url: string }) => ({
  //   title: item.title,
  //   path: item.url.replace(apiUrl, '').replace('/collections', '/search').replace('/pages', '')
  // })) || [];
  return [
    {
      title: 'Home',
      path: '/home',
    },
    {
      title: 'Products',
      path: '/search',
    },
    {
      title: 'About Us',
      path: '/about',
    },
    {
      title: 'Contact',
      path: '/contact',
    }
  ];


}

export async function getPage(handle: string): Promise<Page> {
  const response = await shopifyFetch(`/api/pages/${handle}`, 'POST', { handle });
  return response.data.page;
}

export async function getPages(): Promise<Page[]> {
  const response = await shopifyFetch('/api/pages', 'POST');
  return removeEdgesAndNodes(response.data.pages);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const response = await shopifyFetch(`/api/v1/f/product/info`, 'POST', { uuid: handle });
  return reshapeProductInfo(response.data, false);
}


export async function getProductRecommendations(productId: string): Promise<Product[]> {
  const response = await shopifyFetch(`/api/products/${productId}/recommendations`, 'POST', { productId });
  return reshapeProducts(response.data.productRecommendations);
}

export async function getProducts({
  query,
  reverse,
  sortKey
}: {
  query?: {
    current: number;
    pageSize: number;
    name?: string;
  };
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const response = await shopifyFetch('/api/v1/f/product/list', 'POST', {
    ...query,
    reverse,
    sortKey
  });

  console.log("response:", response);

  return   reshapeProducts(response.data.data);
}
