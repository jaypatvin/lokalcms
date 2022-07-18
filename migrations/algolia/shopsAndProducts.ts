import * as admin from 'firebase-admin'
import { SearchClient } from 'algoliasearch'
import { pick, uniq } from 'lodash'

const db = admin.firestore()

const shopFields = [
  '_meta',
  'archived',
  'community_id',
  'cover_photo',
  'created_at',
  'description',
  'is_close',
  'name',
  'operating_hours',
  'payment_options',
  'profile_photo',
  'status',
  'user_id',
  'updated_at',
]

const productFields = [
  '_meta',
  'archived',
  'availability',
  'base_price',
  'can_subscribe',
  'community_id',
  'created_at',
  'description',
  'gallery',
  'name',
  'product_category',
  'quantity',
  'shop_id',
  'status',
  'user_id',
  'updated_at',
]

const importShopsAndProducts = async (client: SearchClient) => {
  const shopsIndex = client.initIndex('shops')
  const shopsNameDescIndex = client.initIndex('shops_name_desc')
  const shopsCreatedAtAscIndex = client.initIndex('shops_created_at_asc')
  const shopsCreatedAtDescIndex = client.initIndex('shops_created_at_desc')

  const productsIndex = client.initIndex('products')
  const productsNameDescIndex = client.initIndex('products_name_desc')
  const productsCreatedAtAscIndex = client.initIndex('products_created_at_asc')
  const productsCreatedAtDescIndex = client.initIndex('products_created_at_desc')
  const productsPriceAscIndex = client.initIndex('products_price_asc')
  const productsPriceDescIndex = client.initIndex('products_price_desc')

  const shopsRef = await db.collection('shops').get()
  const shopDocs: any = []
  const productDocs: any = []

  for (const shop of shopsRef.docs) {
    const shopData = shop.data()

    // extract info from each products of shop
    const moreInfo: {
      categories: string[]
      products: string[]
    } = {
      categories: [],
      products: [],
    }
    const productsRef = await db.collection('products').where('shop_id', '==', shop.id).get()
    for (const product of productsRef.docs) {
      const productData = product.data()
      moreInfo.categories.push(productData.product_category)
      moreInfo.products.push(productData.name)

      productDocs.push({
        objectID: product.id,
        ...pick(productData, productFields),
        shop_name: shopData.name,
      })
    }
    moreInfo.categories = uniq(moreInfo.categories)

    shopDocs.push({
      objectID: shop.id,
      ...pick(shopData, shopFields),
      ...moreInfo,
    })
  }

  try {
    await shopsIndex.saveObjects(shopDocs)
    await shopsIndex.setSettings({
      replicas: ['shops_name_desc', 'shops_created_at_desc', 'shops_created_at_asc'],
    })
    await shopsIndex.setSettings(
      {
        searchableAttributes: ['categories', 'name', 'products'],
        ranking: [
          'asc(name)',
          'typo',
          'geo',
          'words',
          'filters',
          'proximity',
          'attribute',
          'exact',
          'custom',
        ],
        attributesForFaceting: [
          'filterOnly(categories)',
          'filterOnly(community_id)',
          'filterOnly(is_close)',
          'filterOnly(products)',
          'filterOnly(status)',
          'filterOnly(user_id)',
        ],
      },
      {
        forwardToReplicas: true,
      }
    )
    await shopsNameDescIndex.setSettings({
      ranking: [
        'desc(name)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
    })
    await shopsCreatedAtAscIndex.setSettings({
      ranking: [
        'asc(created_at._seconds)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
    })
    await shopsCreatedAtDescIndex.setSettings({
      ranking: [
        'desc(created_at._seconds)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
    })
    console.log('shops imported to algolia')

    await productsIndex.saveObjects(productDocs)
    await productsIndex.setSettings({
      replicas: [
        'products_name_desc',
        'products_created_at_desc',
        'products_created_at_asc',
        'products_price_asc',
        'products_price_desc',
      ],
    })
    await productsIndex.setSettings(
      {
        searchableAttributes: ['product_category', 'name', 'shop_name'],
        ranking: [
          'asc(name)',
          'typo',
          'geo',
          'words',
          'filters',
          'proximity',
          'attribute',
          'exact',
          'custom',
        ],
        attributesForFaceting: [
          'filterOnly(product_category)',
          'filterOnly(community_id)',
          'filterOnly(shop_id)',
          'filterOnly(status)',
          'filterOnly(user_id)',
          'filterOnly(can_subscribe)',
        ],
      },
      {
        forwardToReplicas: true,
      }
    )
    await productsNameDescIndex.setSettings({
      ranking: [
        'desc(name)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
    })
    await productsCreatedAtAscIndex.setSettings({
      ranking: [
        'asc(created_at._seconds)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
    })
    await productsCreatedAtDescIndex.setSettings({
      ranking: [
        'desc(created_at._seconds)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
    })
    await productsPriceAscIndex.setSettings({
      ranking: [
        'asc(price)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
    })
    await productsPriceDescIndex.setSettings({
      ranking: [
        'desc(price)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
    })
    console.log('products imported to algolia')
  } catch (error) {
    console.error(error)
  }
  return
}

export default importShopsAndProducts
