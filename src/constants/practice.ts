export const PRACTICE_INTENTION_TEXT = `Take a moment to settle your body, speech, and mind.

Wholeheartedly go for refuge in the Buddha, Dharma, and Sangha.

Generate the supreme motivation to dedicate this session for the benefit of all beings.

Rest your attention gently, and return to your intention whenever you are distracted.`;

export const PRACTICE_DEDICATION_TEXT = `By this merit, may all attain omniscience. 

May it defeat the enemy, wrongdoing. 

From the stormy waves of birth, old age, sickness, and death, 

From the ocean of samsara, may I free all beings.`;

export const PRACTICE_DURATION_PRESETS_MINUTES = [1, 2, 5, 10, 20, 30, 45, 60];

export interface PracticeMantraLibraryItem {
  id: string;
  title: string;
  mantra: string;
  description: string;
}

export const PRACTICE_MANTRA_TARGET_OPTIONS = [21, 108, 1000, 10000, 108000];

export const formatMantraTargetLabel = (target: number): string => {
  if (target === 10000) return '10k';
  if (target === 108000) return '108k';
  if (target === 1000000) return '1M';
  return String(target);
};

export const PRACTICE_MANTRA_LIBRARY: PracticeMantraLibraryItem[] = [
  {
    id: 'tara',
    title: 'Green Tara',
    mantra: 'Om Tare Tuttare Ture Soha',
    description:
      'Green Tara embodies swift compassion and protection. This mantra is recited to remove fear and obstacles, and to cultivate courageous compassionate activity.',
  },
  {
    id: 'guru-rinpoche',
    title: 'Guru Rinpoche',
    mantra: 'Om Ah Hung Vajra Guru Pema Siddhi Hung',
    description:
      'This mantra invokes Padmasambhava, the lotus-born guru. It is practiced to awaken wisdom, dissolve obstacles, and connect with enlightened blessing.',
  },
  {
    id: 'chenrezig',
    title: 'Chenrezig',
    mantra: 'Om Mani Padme Hung',
    description:
      'The mantra of Avalokiteshvara, the bodhisattva of compassion. It is recited to open the heart, increase loving-kindness, and benefit all beings.',
  },
];
