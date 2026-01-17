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
    value,
    onChange,
    onFocus,
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

    const isAutoTyping = isMounted && autoType && !isFocused && !isUserTyping && typingEffect.currentText.length > 0;
    const displayValue = isAutoTyping ? typingEffect.currentText : (value !== undefined ? value : inputValue);

    return (
      <Input
        ref={combinedRef}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        readOnly={isAutoTyping}
        className={cn(
          // Foundational styling - Palantir-esque gunmetal dark gray aesthetic
          // Background: liquid glass effect with transparency and backdrop blur
          "bg-gradient-to-br from-[#1a1d24]/85 via-[#1f2532]/80 to-[#1a1f2e]/85",
          "backdrop-blur-xl backdrop-saturate-150",
          // Border: more prominent border with subtle glow
          "border-2 border-[#2a2f3a]/60",
          // Border radius: more rounded for sleek, modern feel
          "rounded-2xl",
          // Text colors - placeholder-like when auto-typing, normal otherwise
          isAutoTyping ? "text-[#9ca3af] select-none cursor-text" : "text-[#e5e7eb]",
          "placeholder:text-[#9ca3af]",
          // Shadow: enhanced floating card effect with liquid glass feel
          "shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3)]",
          // Custom class for animated glow on focus (defined in globals.css)
          "ge-input",
          // Transition for smooth interactions (but not box-shadow to avoid delay)
          "transition-[background-color,border-color,color] duration-200",
          // Height and padding - larger for better presence
          "h-14 px-6 py-4 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
GEInput.displayName = "GEInput";

export { GEInput };
