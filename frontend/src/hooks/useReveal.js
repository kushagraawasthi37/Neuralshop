import { useEffect, useRef } from 'react'

export function useReveal(threshold = 0.15) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(//Mujhe batao jab ye element viewport mein enter kare
      ([entry]/*Information object of observer*/) => {
        if (entry.isIntersecting /*element viewport mein visible?*/) {
          el.classList.add('visible')
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
