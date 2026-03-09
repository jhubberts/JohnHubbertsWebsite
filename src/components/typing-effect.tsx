import { useState, useEffect, useCallback } from 'react'

interface TypingEffectProps {
  phrases: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  className?: string
}

export function TypingEffect({
  phrases,
  typingSpeed = 50,
  deletingSpeed = 40,
  pauseDuration = 2000,
  className,
}: TypingEffectProps) {
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const tick = useCallback(() => {
    const currentPhrase = phrases[phraseIndex]

    if (!isDeleting) {
      // Typing
      if (text.length < currentPhrase.length) {
        return { next: text + currentPhrase[text.length], delay: typingSpeed }
      }
      // Done typing, pause then start deleting
      return { next: text, delay: pauseDuration, startDeleting: true }
    }

    // Deleting
    if (text.length > 0) {
      return { next: text.slice(0, -1), delay: deletingSpeed }
    }
    // Done deleting, move to next phrase
    return { next: '', delay: typingSpeed, nextPhrase: true }
  }, [text, phraseIndex, isDeleting, phrases, typingSpeed, deletingSpeed, pauseDuration])

  useEffect(() => {
    const result = tick()
    const timeout = setTimeout(() => {
      setText(result.next)
      if (result.startDeleting) setIsDeleting(true)
      if (result.nextPhrase) {
        setIsDeleting(false)
        setPhraseIndex((prev) => (prev + 1) % phrases.length)
      }
    }, result.delay)

    return () => clearTimeout(timeout)
  }, [tick, phrases.length])

  return (
    <span className={className}>
      {text}
      <span className="typing-cursor">|</span>
    </span>
  )
}
