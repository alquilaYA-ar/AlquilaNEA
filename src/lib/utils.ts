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

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "https://alquila-nea.vercel.app";
}

export function buildWhatsAppLink(
  phone: string,
  propertyTitle: string,
  propertyPrice: number,
  propertyUrl: string
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
    `¿Sigue disponible para coordinar una visita?`,
    ``,
    propertyUrl,
  ];

  const message = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

/**
 * Serializa un objeto JSON-LD de forma segura para inyección en <script type="application/ld+json">.
 * Escapa caracteres que podrían romper el cierre de la etiqueta script o causar XSS.
 */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
    .replace(/</g, '\\u003c');
}

