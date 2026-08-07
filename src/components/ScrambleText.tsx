import React, { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface ScrambleTextProps {
  words: string[];
  intervalMs?: number;
  className?: string;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐẾỀỂỄỆÍÌỈĨỊỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỊ';

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  words,
  intervalMs = 4000,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(words[0]);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [words, intervalMs, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const targetWord = words[currentIndex];
    let iteration = 0;
    const maxIterations = targetWord.length * 3;

    const scrambleInterval = setInterval(() => {
      setDisplayText(
        targetWord
          .split('')
          .map((letter, index) => {
            if (letter === ' ') return ' ';
            if (index < iteration / 3) {
              return targetWord[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      iteration += 1;

      if (iteration >= maxIterations) {
        setDisplayText(targetWord);
        clearInterval(scrambleInterval);
      }
    }, 45);

    return () => clearInterval(scrambleInterval);
  }, [currentIndex, words]);

  return <span className={className}>{displayText}</span>;
};
