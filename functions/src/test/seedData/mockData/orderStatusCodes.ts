export const orderStatusCodes = [
  {
    id: '10',
    buyer_status: 'Cancelled Order',
    seller_status: 'Cancelled Order',
  },
  {
    id: '20',
    buyer_status: 'Declined Order',
    seller_status: 'Declined Order',
  },
  {
    id: '100',
    buyer_status: 'Waiting for Confirmation',
    seller_status: 'To Confirm',
  },
  {
    id: '200',
    buyer_status: 'To Pay',
    seller_status: 'Waiting for Payment',
  },
  {
    id: '300',
    buyer_status: 'Waiting to Confirm Payment',
    seller_status: 'Payment Received',
  },
  {
    id: '400',
    buyer_status: 'Waiting for Delivery',
    seller_status: 'To Ship',
  },
  {
    id: '500',
    buyer_status: 'To Receive',
    seller_status: 'Shipped Out',
  },
  {
    id: '600',
    buyer_status: 'Past Order',
    seller_status: 'Past Order',
  },
]
