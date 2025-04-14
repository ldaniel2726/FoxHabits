"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function EmailVerificationHandler() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      toast.success("Email cím sikeresen hitelesítve!");
      return;
    }
    
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error === 'access_denied') {
      toast.error(
        typeof errorDescription === 'string' 
          ? 'A hitelesítési link érvénytelen vagy lejárt.'
          : 'A hitelesítési link érvénytelen vagy lejárt.'
      );
    }
  }, [searchParams]);

  return null;
} 