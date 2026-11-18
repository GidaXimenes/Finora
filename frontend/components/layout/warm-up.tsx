'use client';

import { useEffect } from 'react';
import { wakeApi } from '@/lib/api';

/** Ao abrir login/cadastro, já acorda a API enquanto a pessoa digita. */
export function WarmUp() {
  useEffect(() => {
    wakeApi();
  }, []);
  return null;
}
