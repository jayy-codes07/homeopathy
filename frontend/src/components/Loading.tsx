import React from "react";

const Loading = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--color-background)]">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[var(--color-surface-container-high)]"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--color-primary)] animate-spin"></div>
      </div>
      <p className="text-sm text-[var(--color-on-surface-variant)]">Loading...</p>
    </div>
  );
};

export default Loading;