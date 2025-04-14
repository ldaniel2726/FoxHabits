"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface ErrorToastProps {
  error?: string | string[] | undefined;
  errorDescription?: string | string[] | undefined;
}

export function ErrorToast({ error, errorDescription }: ErrorToastProps) {
  useEffect(() => {
    if (error === 'access_denied') {
      toast.error(
        typeof errorDescription === 'string' 
          ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
          : 'A hitelesítési link érvénytelen vagy lejárt.'
      );
    }
  }, [error, errorDescription]);

  return null;
} 