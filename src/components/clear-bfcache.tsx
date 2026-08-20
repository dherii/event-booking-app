// src/components/clear-bfcache.tsx
'use client';

import { useEffect } from 'react';

export default function ClearBfCache() {
  useEffect(() => {
    window.addEventListener('pageshow', (event) => {
      // Se a página foi carregada do cache de histórico (botão voltar/avançar), recarrega
      if (event.persisted) {
        window.location.reload();
      }
    });
  }, []);

  return null;
}