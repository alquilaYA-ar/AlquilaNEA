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

export function buildWhatsAppLink(
  phone: string,
  propertyTitle: string,
  propertyPrice: number,
  propertyUrl: string,
  imageUrl?: string
): string {
  // Asegurar formato internacional de WhatsApp Argentina (código de país 549)
  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = cleanPhone.slice(1);
  }
  if (!cleanPhone.startsWith("549") && !cleanPhone.startsWith("54")) {
    cleanPhone = `549${cleanPhone}`;
  } else if (cleanPhone.startsWith("54") && !cleanPhone.startsWith("549")) {
    cleanPhone = `549${cleanPhone.slice(2)}`;
  }

  const lines = [
    `¡Hola! Me interesa tu publicación en *AlquilaNEA*:`,
    `🏠 *${propertyTitle}*`,
    `💰 *Precio:* ${formatCurrency(propertyPrice)} / mes`,
    `🔗 *Ver publicación:* ${propertyUrl}`,
  ];

  if (imageUrl) {
    lines.push(`📸 *Foto portada:* ${imageUrl}`);
  }

  lines.push(`¿Sigue disponible para coordinar una visita?`);

  const message = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

