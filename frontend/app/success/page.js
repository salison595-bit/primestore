'use client'

import { useState } from "react"

export default function SuccessPage() {
  const [orderNumber] = useState(() =>
    Math.random().toString(36).substring(2, 11).toUpperCase()
  )

  return (
    <div>
      <h1>Pedido confirmado!</h1>
      <p>Número do Pedido:</p>
      <strong>#{orderNumber}</strong>
    </div>
  )
}
