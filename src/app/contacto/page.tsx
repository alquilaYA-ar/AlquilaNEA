'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  Mail,
  Building2,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Phone,
} from 'lucide-react';
import { submitContactMessage } from '@/actions/contact';

export default function ContactoPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    motivo: 'soporte',
    mensaje: '',
    website: '',
  });

  const officialWhatsApp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '5493794123456';
  const officialEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'notificaciones@luxesaas.store';

  const waLink = `https://wa.me/${officialWhatsApp}?text=${encodeURIComponent(
    'Hola equipo de Soporte de AlquilaNEA! Me contacto desde la web para realizar una consulta.'
  )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const res = await submitContactMessage(formData);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'No se pudo enviar el mensaje.');
      return;
    }
    setFormSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* CABECERA */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          Atención al Usuario & Inmobiliarias
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Centro de Contacto & Soporte Oficial
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          ¿Tienes dudas sobre cómo publicar, necesitas asistencia técnica o representas a una inmobiliaria en Corrientes o Chaco? Estamos para ayudarte.
        </p>
      </div>

      {/* CANALES DIRECTOS (WHATSAPP & EMAIL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta WhatsApp */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
            <MessageCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-200">
              Canal Prioritario • Respuesta Rápida
            </div>
            <h2 className="text-2xl font-black">WhatsApp Oficial de Soporte</h2>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Hablá directamente con un operador de AlquilaNEA. Ideal para asistencia inmediata en publicaciones, verificación de matrículas o consultas comerciales.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100">
            <Clock className="w-4 h-4 text-emerald-200" />
            <span>Lunes a Sábados: 08:00 a 20:00 hs</span>
          </div>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-white text-emerald-900 font-bold text-sm shadow-md hover:bg-emerald-50 transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-emerald-800" />
            <span>Iniciar Chat de WhatsApp</span>
          </a>
        </div>

        {/* Tarjeta Correo Electrónico */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
            <Mail className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase font-extrabold tracking-wider text-blue-300">
              Canal Formal & Documentación
            </div>
            <h2 className="text-2xl font-black">Correo Electrónico Oficial</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para acuerdos institucionales, envío de documentación legal, facturación o denuncias de avisos inapropiados.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span>Respuesta en menos de 24 horas hábiles</span>
          </div>

          <a
            href={`mailto:${officialEmail}?subject=Contacto%20AlquilaNEA`}
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>{officialEmail}</span>
          </a>
        </div>
      </div>

      {/* FORMULARIO DE MENSAJE Y FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulario de Contacto */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">
              Envíanos un mensaje desde aquí
            </h2>
            <p className="text-xs text-slate-500">
              Completa los datos y nuestro equipo te responderá a tu correo o WhatsApp a la brevedad.
            </p>
          </div>

          {formSubmitted ? (
            <div className="p-8 text-center space-y-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-emerald-900">¡Mensaje enviado con éxito!</h3>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  Gracias por comunicarte con AlquilaNEA. Un asesor de nuestro equipo revisará tu solicitud y te contactará.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormSubmitted(false);
                  setFormData({
                    nombre: '',
                    email: '',
                    telefono: '',
                    motivo: 'soporte',
                    mensaje: '',
                    website: '',
                  });
                }}
                className="text-xs font-bold text-emerald-800 hover:underline pt-2"
              >
                Enviar otra consulta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tu Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    placeholder="Ej: Marcelo Gómez"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={150}
                    autoComplete="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={30}
                    title="Solo números (8 a 15 dígitos)"
                    autoComplete="tel"
                    placeholder="Ej: 3794112233"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Motivo de Contacto
                  </label>
                  <select
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium"
                  >
                    <option value="soporte">Soporte Técnico / Problemas en la web</option>
                    <option value="inmobiliaria">Soy Inmobiliaria (Alianzas & Planes)</option>
                    <option value="denuncia">Denunciar un aviso sospechoso</option>
                    <option value="sugerencia">Sugerencia o felicitación</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tu Mensaje *
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  maxLength={2000}
                  placeholder="Detállanos en qué podemos ayudarte..."
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                ></textarea>
                <p className="text-[11px] text-slate-400 text-right mt-1">{formData.mensaje.length}/2000</p>
              </div>

              {/* Campo trampa anti-bots (invisible para personas) */}
              <div className="hidden" aria-hidden="true">
                <label>
                  No completar este campo
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </label>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl" role="alert">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Enviando mensaje...' : 'Enviar Consulta'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Preguntas Frecuentes */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm pb-2 border-b border-slate-200">
            <HelpCircle className="w-4 h-4 text-orange-600" />
            <span>Preguntas Frecuentes</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <h4 className="font-bold text-slate-800">¿Publicar un alquiler tiene costo?</h4>
              <p className="text-slate-500">
                No. En AlquilaNEA la publicación de propiedades es 100% gratuita tanto para dueños directos como inmobiliarias.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <h4 className="font-bold text-slate-800">¿Cómo me contactan los inquilinos?</h4>
              <p className="text-slate-500">
                A través del botón directo de WhatsApp que se genera en tu aviso con un mensaje pre-armado y los datos del inmueble.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <h4 className="font-bold text-slate-800">¿Cómo verificar mi inmobiliaria?</h4>
              <p className="text-slate-500">
                Escríbenos a nuestro WhatsApp con tu número de matrícula provincial (CPI) para otorgar el distintivo de inmobiliaria verificada a tus publicaciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

