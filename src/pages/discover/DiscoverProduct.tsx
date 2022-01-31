import { Product } from '../../models'

type ProductData = Product & { id: string; nextAvailable?: string; availableMessage?: string }
type Props = {
  product: ProductData
  unavailable?: boolean
}

const DiscoverProduct = ({ product, unavailable }: Props) => {
  const { name, product_category, quantity, gallery, description, base_price, availableMessage } =
    product
  return (
    <div className="w-80 p-3 shadow-lg m-3">
      <div className="w-full">
        {gallery && gallery.length > 0 ? (
          <img
            className={`w-full h-48 object-cover ${unavailable ? 'opacity-70' : ''}`}
            src={gallery[0].url}
            alt={description}
          />
        ) : (
          <div className="w-full h-48 bg-secondary-300"></div>
        )}
      </div>
      <p>
        <strong>{name}</strong>
      </p>
      <p>category: {product_category}</p>
      <p>{description}</p>
      {availableMessage ? <p>Availability: {availableMessage}</p> : ''}
      <div className="flex justify-between">
        <p>Php{base_price}</p>
        <p>Quantity: {quantity}</p>
      </div>
    </div>
  )
}

export default DiscoverProduct
