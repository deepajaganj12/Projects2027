import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], discount: 0, taxRate: 5 },
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) {
        existing.quantity += 1
        existing.subtotal = existing.quantity * existing.sellingPrice
      } else {
        state.items.push({ ...action.payload, quantity: 1, subtotal: action.payload.sellingPrice })
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload)
    },
    updateQuantity: (state, action) => {
      const item = state.items.find(i => i.id === action.payload.id)
      if (item) {
        item.quantity = action.payload.quantity
        item.subtotal = item.quantity * item.sellingPrice
      }
    },
    clearCart: (state) => {
      state.items = []
      state.discount = 0
    },
    setDiscount: (state, action) => { state.discount = action.payload },
    setTaxRate: (state, action) => { state.taxRate = action.payload },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart, setDiscount, setTaxRate } = cartSlice.actions
export default cartSlice.reducer
