'use client';

import { AuthProvider } from "@/contexts/auth-context";
import { PersonalizationProvider } from "@/contexts/personalization-context";
import { CartProvider } from "@/contexts/cart-context";
import { OrderProvider } from "@/contexts/order-context";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <PersonalizationProvider>
        <CartProvider>
          <OrderProvider>
            {children}
          </OrderProvider>
        </CartProvider>
      </PersonalizationProvider>
    </AuthProvider>
  );
}
