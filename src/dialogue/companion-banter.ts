/**
 * Companion Banter System
 *
 * Provides personality-filled toast messages during runs.
 * Each character has 3-5 lines per event type.
 */

import { MakkoEngine } from '@makko/engine';
import { COLORS, FONTS } from '../ui/theme';

/**
 * Banter event types
 */
export type BanterEvent = 'runStart' | 'discovery' | 'hullBreach' | 'extraction';

/**
 * Banter lines for each character
 */
const BANTER_LINES: Record<string, Record<BanterEvent, string[]>> = {
  'max_chen': {
    runStart: [
      "Alright, let's see what we're working with.",
      "Systems check complete. Ready to proceed.",
      "I've seen worse configurations. Let's optimize.",
      "Memory banks clear. Focused and ready.",
      "Time to make this system work for us."
    ],
    discovery: [
      "Interesting. Let me check the systems.",
      "This could be useful. Analyzing now.",
      "A find worth remembering. Literally.",
      "Data patterns emerging. This is promising.",
      "My working memory just lit up. Good sign."
    ],
    hullBreach: [
      "Structural integrity compromised. Adapting.",
      "Not ideal. Rerouting power to stabilize.",
      "This is why I prefer clean architectures.",
      "Containment protocols active. We'll manage.",
      "The system is resilient. Like me."
    ],
    extraction: [
      "Clean extraction. Good work, team.",
      "Data secured. Rewards locked in.",
      "That's how you close a loop efficiently.",
      "Optimal outcome achieved. Well done.",
      "System performance: acceptable."
    ]
  },
  
  'imani_okoro': {
    runStart: [
      "Everyone stays safe. That's the mission.",
      "Medical supplies ready. Just in case.",
      "I've seen crews make it through worse.",
      "Stay close, stay alive. Simple as that.",
      "My job is making sure we all go home."
    ],
    discovery: [
      "Fascinating. And nobody got hurt finding it.",
      "This could help the whole crew.",
      "A safe discovery is a good discovery.",
      "Medical applications... interesting.",
      "Crew morale boost incoming."
    ],
    hullBreach: [
      "TRIAGE PROTOCOL! Everyone to stations!",
      "Casualties minimal. We can recover.",
      "This is what we trained for. Stay calm.",
      "Medical emergency contained. For now.",
      "The crew comes first. Always."
    ],
    extraction: [
      "All hands accounted for? Good.",
      "Safe extraction. That's what matters.",
      "Everyone made it. That's a win.",
      "Mission complete. No casualties reported.",
      "Crew safety: 100%. My kind of extraction."
    ]
  },
  
  'jax_vasquez': {
    runStart: [
      "This bucket's held together by hope and rust.",
      "Time to work some field magic.",
      "I've patched worse with less. Let's go.",
      "Structural assessment: questionable. We'll manage.",
      "Keep the hull intact, keep us alive."
    ],
    discovery: [
      "Could use this. If it's not broken.",
      "Structural components? Always useful.",
      "This might patch a few critical systems.",
      "Practical. I like practical.",
      "Add it to the repair queue."
    ],
    hullBreach: [
      "FIELD RETROFIT! Hold her together!",
      "Hull breach! Stabilizing with whatever works!",
      "This is why I carry extra sealant!",
      "She's breaking up! Patching now!",
      "Emergency repairs! She can take it!"
    ],
    extraction: [
      "Still in one piece. Barely.",
      "Hull integrity: acceptable. For now.",
      "Made it out before she fell apart.",
      "That was closer than I like.",
      "Ship's still flying. Job done."
    ]
  },
  
  'sera_kim': {
    runStart: [
      "Following the signal. Wherever it leads.",
      "Ancient data waiting to be found.",
      "The void keeps secrets. Let's uncover them.",
      "Signal trace active. Ready for discovery.",
      "Every dive is a chance to learn."
    ],
    discovery: [
      "The signal led us here. Perfect.",
      "Pre-Collapse artifacts. Fascinating.",
      "This changes our understanding.",
      "Data preserved across centuries.",
      "The void rewards the curious."
    ],
    hullBreach: [
      "The signal didn't warn us about this...",
      "Some mysteries are dangerous.",
      "Science requires risk. This is too much.",
      "Data lost. But we survive.",
      "The void doesn't forgive mistakes."
    ],
    extraction: [
      "Knowledge secured. Worth the risk.",
      "Data preserved for analysis.",
      "Another piece of the puzzle saved.",
      "The signal guided us safely.",
      "What we learned matters most."
    ]
  },
  
  'rook_stone': {
    runStart: [
      "Time to fill the hold.",
      "Salvage rules: get in, get paid, get out.",
      "I've never lost a haul. Not starting now.",
      "Eyes on the prize, feet on the deck.",
      "Dead drops ready. Let's make credits."
    ],
    discovery: [
      "That's going in the hold. Safely.",
      "Value detected. Securing now.",
      "This'll fetch a good price.",
      "Salvage acquired. Let's keep it.",
      "One more piece for the collection."
    ],
    hullBreach: [
      "The haul! Save the haul!",
      "Not today. Dead drop activated!",
      "I've never lost a haul. NOT TODAY!",
      "Secure the salvage! Emergency protocol!",
      "Partial extraction better than total loss!"
    ],
    extraction: [
      "Haul secured. Credits earned.",
      "Clean extraction, full hold. Perfect.",
      "Another successful salvage operation.",
      "That's how you get paid.",
      "Dead drops saved our bacon."
    ]
  },
  
  'del_reyes': {
    runStart: [
      "Ships that don't exist. That's my specialty.",
      "Ghost credentials ready. Let's work.",
      "Official channels are for other people.",
      "I have a talent for finding the unfindable.",
      "Target acquired. Approach unauthorized."
    ],
    discovery: [
      "Off the books. Just how I like it.",
      "This didn't exist. Until now.",
      "Ghost find. No records, no questions.",
      "Another piece of the hidden puzzle.",
      "Authorization: me. Approval: granted."
    ],
    hullBreach: [
      "Even ghosts can't hide from this!",
      "Unauthorized failure! Scrambling!",
      "My credentials didn't cover this!",
      "Ghost protocol: emergency exit!",
      "This ship wasn't supposed to kill us!"
    ],
    extraction: [
      "Ghost extraction. No traces.",
      "Unauthorized departure: successful.",
      "Off the books. As requested.",
      "Another ghost in the machine.",
      "Mission that never happened: complete."
    ]
  }
};

/**
 * Toast message state
 */
interface ToastMessage {
  text: string;
  timestamp: number;
  duration: number;
  color: string;
}

let currentToast: ToastMessage | null = null;

/**
 * Get a random banter line for a character and event
 */
export function getRandomBanter(authoredId: string, event: BanterEvent): string | null {
  const characterLines = BANTER_LINES[authoredId];
  if (!characterLines) return null;
  
  const lines = characterLines[event];
  if (!lines || lines.length === 0) return null;
  
  const index = Math.floor(Math.random() * lines.length);
  return lines[index];
}

/**
 * Display a banter toast message
 */
export function displayBanterToast(name: string, line: string, color: string = COLORS.neonCyan): void {
  currentToast = {
    text: `${name}: "${line}"`,
    timestamp: Date.now(),
    duration: 3000, // 3 seconds
    color
  };
}

/**
 * Display an ability activation toast
 */
export function displayAbilityToast(abilityName: string, message: string): void {
  currentToast = {
    text: `${abilityName}: ${message}`,
    timestamp: Date.now(),
    duration: 2500,
    color: COLORS.neonMagenta
  };
}

/**
 * Display a simple toast message
 */
export function displayToast(message: string, color: string = COLORS.white): void {
  currentToast = {
    text: message,
    timestamp: Date.now(),
    duration: 2000,
    color
  };
}

/**
 * Check if toast is currently active
 */
export function isToastActive(): boolean {
  if (!currentToast) return false;
  return Date.now() - currentToast.timestamp < currentToast.duration;
}

/**
 * Render the current toast message
 */
export function renderToast(display: typeof MakkoEngine.display): void {
  if (!currentToast) return;
  
  const elapsed = Date.now() - currentToast.timestamp;
  if (elapsed >= currentToast.duration) {
    currentToast = null;
    return;
  }
  
  // Fade out in last 500ms
  const fadeStart = currentToast.duration - 500;
  const alpha = elapsed > fadeStart 
    ? 1 - ((elapsed - fadeStart) / 500)
    : 1;
  
  const { width, height } = display;
  
  // Measure text for background
  const metrics = display.measureText(currentToast.text, { font: FONTS.bodyFont });
  const padding = 20;
  const bgWidth = metrics.width + padding * 2;
  const bgHeight = 40;
  const x = (width - bgWidth) / 2;
  const y = height / 2 + 200; // Below center
  
  // Background with rounded corners
  display.drawRoundRect(x, y, bgWidth, bgHeight, 10, {
    fill: '#000000',
    alpha: 0.7 * alpha
  });
  
  // Border
  display.drawRoundRect(x, y, bgWidth, bgHeight, 10, {
    stroke: currentToast.color,
    lineWidth: 2,
    alpha: 0.8 * alpha
  });
  
  // Text
  display.drawText(currentToast.text, width / 2, y + bgHeight / 2, {
    font: FONTS.bodyFont,
    fill: currentToast.color,
    align: 'center',
    baseline: 'middle',
    alpha
  });
}

/**
 * Clear the current toast
 */
export function clearToast(): void {
  currentToast = null;
}
