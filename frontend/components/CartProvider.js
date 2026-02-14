"use client"
import { createContext, useContext, useMemo, useReducer } from "react";

const CartContext = createContext();

function reducer(state, action) {
  if (action.type === "add") {
    const existing = state.items.find(i => i.id === action.item.id);
    if (existing) {
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i
        )
      };
    }
    return { ...state, items: [...state.items, { ...action.item, qty: 1 }] };
  }
  if (action.type === "remove") {
    return {
      ...state,
      items: state.items.filter(i => i.id !== action.id)
    };
  }
  if (action.type === "inc") {
    return {
      ...state,
      items: state.items.map(i =>
        i.id === action.id ? { ...i, qty: i.qty + 1 } : i
      )
    };
  }
  if (action.type === "dec") {
    return {
      ...state,
      items: state.items.map(i =>
        i.id === action.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i
      )
    };
  }
  if (action.type === "clear") {
    return { ...state, items: [] };
  }
  return state;
}

export default function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
