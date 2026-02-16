'use client'

import { useEffect, useState } from "react"

export default function SuccessPage() {
  const [orderNumber, setOrderNumber] = useState("")

  useEffect(() => {
    const generated = Math.random().toString(36).substring(2, 11).toUpperCase()
    const numero = generated
    setOrderNumber(numero)
  }, [])

  return (
    <div>
      <h1>Pedido confirmado!</h1>
      <p>Número do Pedido:</p>
      <strong>#{orderNumber}</strong>
    </div>
  )
}
