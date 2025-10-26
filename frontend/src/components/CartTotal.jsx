import React, { useContext } from 'react'
import { shopDataContext } from '../context/ShopContext'
import Title from './Title'

function CartTotal() {
  const { currency, delivery_fee, getCartAmount } = useContext(shopDataContext)
  const subtotal = getCartAmount();
  const total = subtotal === 0 ? 0 : subtotal + delivery_fee;

  return (
    <div className="w-full">
      <div className="">
        <Title text1={'CART'} text2={'TOTAL'} />
      </div>
      <div className="flex flex-col gap-2  text-sm bg-[#232a36]/70 
          rounded-xl shadow border-2 border-[#3ecad3] px-4 py-3 sm:px-7 sm:py-5">
        <div className="flex justify-between items-center text-white text-base  ">
          <span>Subtotal</span>
          <span>{currency} {subtotal}.00</span>
        </div>
        <div className="border-b border-[#41becf] opacity-30 "></div>
        <div className="flex justify-between items-center text-white text-base  ">
          <span>Shipping Fee</span>
          <span>{currency} {delivery_fee}</span>
        </div>
        <div className="border-b border-[#41becf] opacity-30 "></div>
        <div className="flex justify-between items-center text-white font-bold   ">
          <span>Total</span>
          <span>{currency} {total}</span>
        </div>
      </div>
    </div>
  )
}

export default CartTotal;
