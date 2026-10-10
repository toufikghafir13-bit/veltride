"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import cart from "../lib/cart.cjs";
const Context = createContext(null);
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const current = useRef([]);
  useEffect(() => {
    function read() {
      try {
        const value = cart.cleanCart(JSON.parse(localStorage.getItem(cart.STORAGE_KEY) || "[]"));
        current.current = value;
        setItems(value);
      } catch {
        current.current = [];
        setItems([]);
      }
    }
    read();
    setReady(true);
    const sync = event => { if (event.key === cart.STORAGE_KEY || event.key === null) read(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function commit(value) {
    const next = cart.cleanCart(value);
    current.current = next;
    setItems(next);
    try {
      localStorage.setItem(cart.STORAGE_KEY, JSON.stringify(next));
      setStorageError("");
    } catch {
      setStorageError("Your browser could not save this cart. It may be lost when you leave this page.");
    }
  }
  function add(slug, size) {
    const result = cart.addItem(current.current, slug, size);
    if (!result.error) commit(result.items);
    return result.error || "";
  }
  function quantity(slug, size, value) {
    if (!Number.isInteger(value) || value < 1 || value > cart.MAX_QUANTITY) return;
    commit(current.current.map(item => item.slug === slug && item.size === size ? { ...item, quantity: value } : item));
  }
  function remove(slug, size) { commit(current.current.filter(item => item.slug !== slug || item.size !== size)); }
  return <Context.Provider value={{ items, ready, add, quantity, remove, clear: () => commit([]), storageError }}>
    {children}
  </Context.Provider>;
}
export function useCart() {
  const value = useContext(Context);
  if (!value) throw new Error("CartProvider is required");
  return value;
}
