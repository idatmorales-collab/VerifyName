import React from 'react';
import { Sparkles, Code2, ShieldCheck, Heart, Award, Cpu, CheckCircle2 } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-4 py-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-black text-2xl shadow-xl">
          M
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center justify-center gap-2">
            MACRUMO <span className="text-sm px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">STUDIO</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
            Plataforma interna privada para la gestión, validación y creación de nombres comerciales de mobiliario de alta gama.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-mono text-neutral-600 dark:text-neutral-300">
          <span>Versión 1.0</span>
          <span>•</span>
          <span>Muebles Macrumo 2026</span>
        </div>
      </div>

      {/* Development Credits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-500">
            <Code2 className="w-4 h-4" />
            <span>Desarrollo & Arquitectura</span>
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Renzo D. Morales
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Diseño de arquitectura, sistema de autenticación privada, motor de detección de similitudes fonéticas y lógica full-stack.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-purple-500">
            <Sparkles className="w-4 h-4" />
            <span>Inteligencia Artificial</span>
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Asistencia de IA (Gemini 3.6 Flash)
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Asistencia inteligente durante la ideación de nombres comerciales, análisis etimológico y generación de lemas de diseño.
          </p>
        </div>
      </div>

      {/* Feature Principles */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
        <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-500" />
          Principios de Diseño de Macrumo Studio
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-neutral-800 dark:text-neutral-200">Acceso Privado e Interno</div>
              <div className="text-neutral-500 text-[11px]">Diseñado exclusivamente para el equipo interno de diseño de Muebles Macrumo.</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-neutral-800 dark:text-neutral-200">Zero Colisiones de Marca</div>
              <div className="text-neutral-500 text-[11px]">Algoritmo de prevención de duplicados con cálculo de riesgo fonético y ortográfico.</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-neutral-800 dark:text-neutral-200">Compatibilidad PWA</div>
              <div className="text-neutral-500 text-[11px]">Instalable como aplicación independiente en computadoras y dispositivos móviles.</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-neutral-800 dark:text-neutral-200">Trazabilidad Total</div>
              <div className="text-neutral-500 text-[11px]">Auditoría detallada de cada registro, actualización y consulta en la plataforma.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
