export const motion = {
  duration: {
    fast: 140,
    normal: 220,
    slow: 320,
  },
  spring: {
    soft: {
      damping: 18,
      stiffness: 220,
      mass: 0.9,
    },
    snappy: {
      damping: 16,
      stiffness: 280,
      mass: 0.85,
    },
  },
  scale: {
    pressIn: 0.97,
    pressInSubtle: 0.985,
    active: 1,
  },
  translate: {
    iconLift: -3,
    titleShift: 8,
    cardEnter: 10,
  },
  opacity: {
    hidden: 0,
    muted: 0.72,
    visible: 1,
  },
} as const;
