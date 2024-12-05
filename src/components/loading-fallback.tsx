import { LoaderCircle } from "lucide-react";
import React from "react";

export default function LoadingFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <LoaderCircle className="animate-spin" size={32} />
    </div>
  );
}
