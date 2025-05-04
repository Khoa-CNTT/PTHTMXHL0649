import { useState, useEffect, useCallback } from "react";

export const useTypewriterHook = ({
  words = ["Hello World!"],
  typeSpeed = 80,
  delaySpeed = 1500,
  onLoopDone,
  onType,
}) => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const handleTyping = useCallback(() => {
    if (isDone) return;

    const currentWord = words[index % words.length];
    setText((prev) => currentWord.slice(0, prev.length + 1));

    if (text === currentWord) {
      setTimeout(() => {
        setIsDone(true);
        if (onLoopDone) onLoopDone();
      }, delaySpeed);
    }

    if (onType) onType(index);
  }, [text, words, index, isDone, delaySpeed, onLoopDone, onType]);

  useEffect(() => {
    if (isDone) return;
    const timeout = setTimeout(handleTyping, typeSpeed);
    return () => clearTimeout(timeout);
  }, [handleTyping, typeSpeed]);

  return [text, { isDone }];
};
