"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface GEInputProps extends React.ComponentProps<"input"> {
  className?: string;
  autoType?: boolean;
  typingTexts?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  loading?: boolean;
  focusRing?: boolean;
  error?: boolean;
  errorMessage?: string;
  onEnter?: (value: string) => void;
}

// Custom hook for typing effect
function useTypingEffect(
  texts: string[],
  typingSpeed: number = 50,
  deletingSpeed: number = 30,
  pauseDuration: number = 2000,
  loop: boolean = true,
  isPaused: boolean = false
) {
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0);
  const [currentText, setCurrentText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isPausedInternal, setIsPausedInternal] = React.useState(false);

  React.useEffect(() => {
    if (texts.length === 0 || isPaused) return;

    const currentFullText = texts[currentTextIndex];
    const speed = isDeleting ? deletingSpeed : typingSpeed;

    if (isPausedInternal) {
      const pauseTimer = setTimeout(() => {
        setIsPausedInternal(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentFullText.length) {
          setCurrentText(currentFullText.slice(0, currentText.length + 1));
        } else {
          // Finished typing, pause then delete
          setIsPausedInternal(true);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          // Finished deleting, move to next text
          setIsDeleting(false);
          if (loop) {
            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
          } else if (currentTextIndex < texts.length - 1) {
            setCurrentTextIndex((prev) => prev + 1);
          }
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [currentText, currentTextIndex, isDeleting, isPausedInternal, texts, typingSpeed, deletingSpeed, pauseDuration, loop, isPaused]);

  return { currentText, reset: () => { setCurrentText(""); setCurrentTextIndex(0); setIsDeleting(false); setIsPausedInternal(false); } };
}

const GEInput = React.forwardRef<HTMLInputElement, GEInputProps>(
  ({ 
    className, 
    autoType = false,
    typingTexts = [
      "What's happening in Venezuela?",
      "Show me the latest in the Middle East",
      "What happened today in the world?",
    ],
    typingSpeed = 50,
    deletingSpeed = 30,
    pauseDuration = 2000,
    loop = true,
    loading = false,
    focusRing = false,
    error = false,
    errorMessage,
    value,
    onChange,
    onFocus,
    onKeyDown,
    onEnter,
    ...props 
  }, ref) => {
    const [isMounted, setIsMounted] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const [isUserTyping, setIsUserTyping] = React.useState(false);
    
    // Only start typing effect after component is mounted (client-side)
    React.useEffect(() => {
      setIsMounted(true);
    }, []);
    
    const typingEffect = useTypingEffect(
      isMounted && autoType && !isFocused && !isUserTyping ? typingTexts : [],
      typingSpeed,
      deletingSpeed,
      pauseDuration,
      loop,
      !isMounted || isFocused || isUserTyping
    );
    
    const [inputValue, setInputValue] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = React.useMemo(() => {
      if (typeof ref === "function") {
        return (node: HTMLInputElement | null) => {
          inputRef.current = node;
          ref(node);
        };
      } else if (ref) {
        return (node: HTMLInputElement | null) => {
          inputRef.current = node;
          if (ref.current !== undefined) {
            (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
          }
        };
      }
      return (node: HTMLInputElement | null) => {
        inputRef.current = node;
      };
    }, [ref]);

    // Update input value when auto-typing (only when not focused and not user typing)
    React.useEffect(() => {
      if (autoType && !isFocused && !isUserTyping && typingEffect.currentText !== undefined) {
        setInputValue(typingEffect.currentText);
      }
    }, [typingEffect.currentText, autoType, isFocused, isUserTyping]);

    // Handle focus - stop animation and clear input
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      setIsUserTyping(false);
      setInputValue("");
      typingEffect.reset();
      onFocus?.(e);
    };

    // Handle blur - resume animation if autoType is enabled
    const handleBlur = () => {
      setIsFocused(false);
      if (inputValue === "") {
        setIsUserTyping(false);
      } else {
        setIsUserTyping(true);
      }
    };

    // Handle manual input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      setIsUserTyping(true);
      onChange?.(e);
    };

    // Handle Escape key to unfocus and Enter key to submit
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        inputRef.current?.blur();
      } else if (e.key === "Enter" && !isAutoTyping && inputValue.trim()) {
        e.preventDefault();
        if (onEnter) {
          onEnter(inputValue.trim());
        }
      }
      onKeyDown?.(e);
    };

    const isAutoTyping = isMounted && autoType && !isFocused && !isUserTyping && typingEffect.currentText.length > 0;
    const displayValue = isAutoTyping ? typingEffect.currentText : (value !== undefined ? value : inputValue);

    return (
      <div className="relative">
        <Input
          ref={combinedRef}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          readOnly={isAutoTyping}
          className={cn(
            // Foundational styling - Palantir-esque gunmetal dark gray aesthetic
            // Background: liquid glass effect with transparency and backdrop blur
            "bg-gradient-to-br from-[#1a1d24]/85 via-[#1f2532]/80 to-[#1a1f2e]/85",
            "backdrop-blur-xl backdrop-saturate-150",
            // Border: more prominent border with subtle glow
            // Error state: subtle amber/orange tint on border (not red/fatal)
            error 
              ? "border-2 border-amber-500/40" 
              : "border-2 border-[#2a2f3a]/60",
            // Border radius: more rounded for sleek, modern feel
            "rounded-2xl",
            // Text colors - placeholder-like when auto-typing, normal otherwise
            // Cursor - always text cursor since it's an input field
            isAutoTyping ? "text-[#9ca3af] select-none" : "text-[#e5e7eb]",
            "cursor-text",
            "placeholder:text-[#9ca3af]",
            // Shadow: enhanced floating card effect with liquid glass feel
            // Error state: subtle amber glow (not harsh red)
            error
              ? "shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_40px_rgba(245,158,11,0.15),0_4px_16px_rgba(0,0,0,0.3)]"
              : "shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3)]",
            // Custom class for animated glow on focus (defined in globals.css) - only apply when focusRing is true
            focusRing && "ge-input",
            // Transition for smooth interactions (but not box-shadow to avoid delay)
            "transition-[background-color,border-color,color] duration-200",
            // Height and padding - larger for better presence
            // Add extra padding on right when loading to make room for spinner
            "h-14 py-4 text-base",
            loading ? "pl-6 pr-12" : "px-6",
            className
          )}
          {...props}
        />
        {loading && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
        {error && errorMessage && (
          <div className="absolute -bottom-6 left-0 right-0 mt-1">
            <p className="text-sm text-amber-400/80 px-1">{errorMessage}</p>
          </div>
        )}
      </div>
    );
  }
);
GEInput.displayName = "GEInput";

export { GEInput };
