"use client";

import { useMemo } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface PasswordMeterProps {
  password: string;
}

export default function PasswordMeter({ password }: PasswordMeterProps) {
  const analysis = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        percentage: 0,
        label: "",
        color: "bg-gray-200",
        checks: {
          length: false,
          long: false,
          upperLower: false,
          numbers: false,
          symbols: false,
        },
      };
    }

    const checks = {
      length: password.length >= 8,
      long: password.length >= 12,
      upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^a-zA-Z\d]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    const percentage = (score / 5) * 100;

    let label = "";
    let color = "";

    if (score === 0) {
      label = "Muy débil";
      color = "bg-red-500";
    } else if (score === 1) {
      label = "Débil";
      color = "bg-orange-500";
    } else if (score === 2) {
      label = "Regular";
      color = "bg-yellow-500";
    } else if (score === 3) {
      label = "Buena";
      color = "bg-blue-500";
    } else if (score === 4) {
      label = "Fuerte";
      color = "bg-green-500";
    } else {
      label = "Muy fuerte";
      color = "bg-green-600";
    }

    return { score, percentage, label, color, checks };
  }, [password]);

  return (
    <div className="mt-3 space-y-3 transition-colors">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors">Nivel de seguridad</span>
          {password && (
            <span className={`text-xs font-bold transition-colors ${
              analysis.score <= 1 ? "text-red-600 dark:text-red-400" :
              analysis.score === 2 ? "text-orange-600 dark:text-orange-400" :
              analysis.score === 3 ? "text-yellow-600 dark:text-yellow-400" :
              analysis.score === 4 ? "text-blue-600 dark:text-blue-400" :
              "text-green-600 dark:text-green-400"
            }`}>
              {analysis.label}
            </span>
          )}
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner border border-gray-300 dark:border-gray-600 transition-colors">
          <div
            className={`h-full transition-all duration-500 ease-out ${analysis.color} shadow-sm rounded-full`}
            style={{ width: `${analysis.percentage}%`, minWidth: password ? '4px' : '0' }}
          />
        </div>
      </div>

      {password && (
        <div className="space-y-1.5">
          {[
            { check: analysis.checks.length, label: "Al menos 8 caracteres" },
            { check: analysis.checks.long, label: "Al menos 12 caracteres (recomendado)" },
            { check: analysis.checks.upperLower, label: "Mayúsculas y minúsculas" },
            { check: analysis.checks.numbers, label: "Al menos un número" },
            { check: analysis.checks.symbols, label: "Al menos un símbolo (!@#$%...)" },
          ].map((req, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs transition-colors">
              {req.check ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0 transition-colors" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0 transition-colors" />
              )}
              <span className={`transition-colors ${req.check ? "text-green-700 dark:text-green-300 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

