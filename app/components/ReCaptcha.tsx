"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface ReCaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
}

export default function ReCaptcha({ onVerify, className = "" }: ReCaptchaProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = () => {
    if (isVerified) {
      setIsVerified(false);
      onVerify(false);
      return;
    }

    setIsChecking(true);
    // Simular verificación (como Google reCAPTCHA)
    setTimeout(() => {
      setIsChecking(false);
      setIsVerified(true);
      onVerify(true);
    }, 1500);
  };

  return (
    <div className={`bg-gray-50 border border-gray-300 rounded p-3 ${className}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCheck}
          disabled={isChecking}
          className={`
            relative flex items-center justify-center
            w-10 h-10 border-2 rounded transition-all duration-200
            ${isVerified
              ? "bg-green-500 border-green-500"
              : "bg-white border-gray-400 hover:border-gray-500"
            }
            ${isChecking ? "opacity-50 cursor-wait" : "cursor-pointer"}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            shadow-sm
          `}
        >
          {isChecking ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : isVerified ? (
            <Check className="w-6 h-6 text-white" strokeWidth={3} />
          ) : null}
        </button>
        <div className="flex-1">
          <div className="text-sm text-gray-700 font-medium leading-tight">
            I'm not a robot
          </div>
          <div className="text-xs text-gray-500 mt-0.5 leading-tight">
            reCAPTCHA
            <span className="text-blue-600 ml-1 hover:underline cursor-pointer">Privacy</span>
            {" - "}
            <span className="text-blue-600 hover:underline cursor-pointer">Terms</span>
          </div>
        </div>
        <div className="w-12 h-12 border border-gray-300 rounded bg-white flex items-center justify-center shadow-sm">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#4285F4" opacity="0.1"/>
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="#4285F4"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

