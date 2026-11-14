import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "ARS"): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildWhatsAppLink(phone: string, propertyTitle: string, propertyPrice: number, propertyUrl: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const message = encodeURIComponent(
    `¡Hola! Vi en AlquilaNEA tu publicación "${propertyTitle}" (${formatCurrency(propertyPrice)}). ¿Sigue disponible? Podés verla aquí: ${propertyUrl}`
  );
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

