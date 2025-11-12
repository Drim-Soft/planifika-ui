"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import ThemeToggle from "./ThemeToggle";

export default function ThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ThemeToggle />
    </ThemeProvider>
  );
}

