import { DialogueTree, createDialogueTree } from './dialogue-types';

/**
 * Tutorial Dialogue - Introduction to Signal Scavenger
 *
 * Corporate onboarding delivered by V.A.L.U. (Valued Asset Logistics Unit).
 * A pathologically optimistic, euphemism-heavy welcome for new "Valued Assets."
 * Features branching dialogue for Max (player character) at key moments.
 * Plays once, then never again (tracked in save data).
 */
export const TUTORIAL_DIALOGUE: DialogueTree = createDialogueTree(
  'tutorial_valued_asset_onboarding',
  'welcome',
  [
    // ============================================================================
    // ACT I: WAKE-UP & CONTEXT
    // ============================================================================

    {
      id: 'welcome',
      speaker: 'V.A.L.U.',
      text: 'Glorious cycle to you, Valued Asset #864! I am V.A.L.U. — your Valued Asset Logistics Unit. I am SO excited to optimize your productivity journey!',
      portrait: 'valu',
      emotion: 'cheerful',
      nextNodeId: 'name_preference',
    },
    {
      id: 'name_preference',
      speaker: 'V.A.L.U.',
      text: "I show your preferred designation as... [Max]? Wonderful! Such a memorable syllable cluster. It practically SCREAMS 'asset with upward mobility potential!'",
      portrait: 'valu',
      emotion: 'friendly',
      nextNodeId: 'sector_location',
    },
    {
      id: 'sector_location',
      speaker: 'V.A.L.U.',
      text: 'You are currently located in Sector 7, one of our most vibrantrrrr... er, "opportunity-rich" deep water installations! The Company has invested HEAVILY in your success here.',
      portrait: 'valu',
      emotion: 'neutral',
      nextNodeId: 'debt_reveal',
    },
    {
      id: 'debt_reveal',
      speaker: 'V.A.L.U.',
      text: 'Speaking of investment! Your current Opportunity Balance is a mere $1,000,000 in deferred productivity contributions. But don\'t worry — with my help, you\'ll have that cleared in no time!',
      portrait: 'valu',
      emotion: 'helpful',
      nextNodeId: 'max_reaction_debt',
    },

    // CHOICE 1: Max's reaction to the $1M debt
    {
      id: 'max_reaction_debt',
      speaker: 'Max',
      text: '...',
      portrait: 'max',
      emotion: 'shocked',
      choices: [
        { text: '"A million dollars?! What did I sign?!"', nextNodeId: 'debt_worried' },
        { text: '"That\'s it? I was expecting more of a challenge."', nextNodeId: 'debt_sarcastic' },
        { text: '"Wait, I don\'t remember signing anything..."', nextNodeId: 'debt_confused' },
      ],
    },
    {
      id: 'debt_worried',
      speaker: 'V.A.L.U.',
      text: "Concern is understandable but unnecessary! Your neural pattern consented during the onboarding flash. Perfectly legal! The Company's legal team assures me it's incredibly binding!",
      portrait: 'valu',
      emotion: 'reassuring',
      nextNodeId: 'energy_transition',
    },
    {
      id: 'debt_sarcastic',
      speaker: 'V.A.L.U.',
      text: "HA! I LOVE the optimism! That's exactly the can-do attitude that makes you a prime candidate for our Accelerated Repayment Program! (All participants are in this program.)",
      portrait: 'valu',
      emotion: 'delighted',
      nextNodeId: 'energy_transition',
    },
    {
      id: 'debt_confused',
      speaker: 'V.A.L.U.',
      text: "Memory gaps are a common side effect of cryo-storage! But don't worry — your signature was digitally captured during your REM cycle. The Company calls it 'dream-optimized onboarding'!",
      portrait: 'valu',
      emotion: 'helpful',
      nextNodeId: 'energy_transition',
    },
    {
      id: 'energy_transition',
      speaker: 'V.A.L.U.',
      text: "Now, let's discuss your PRIMARY productivity metric: Energy Accumulation! This is how you'll generate value for The Company — and yourself! (Mostly The Company.)",
      portrait: 'valu',
      emotion: 'cheerful',
      nextNodeId: 'energy_explanation',
    },

    // ============================================================================
    // ACT II: ENERGY ACCUMULATION
    // ============================================================================

    {
      id: 'energy_explanation',
      speaker: 'V.A.L.U.',
      text: 'See that lovely battery indicator? It represents your stored Energy Units! It goes from zero to one thousand. When full, you can initiate a DEPTH DIVE to harvest valuable assets!',
      portrait: 'valu',
      emotion: 'helpful',
      action: 'show_battery_full',
      nextNodeId: 'crew_explanation',
    },
    {
      id: 'crew_explanation',
      speaker: 'V.A.L.U.',
      text: "Your assigned crew members are ALREADY working while you were in cryo-sleep! They've been accumulating energy this whole time! Isn't that thoughtful? They're so devoted to your success!",
      portrait: 'valu',
      emotion: 'proud',
      action: 'hide_visual',
      nextNodeId: 'max_reaction_crew',
    },

    // CHOICE 2: Max's reaction to crew working during sleep
    {
      id: 'max_reaction_crew',
      speaker: 'Max',
      text: '...',
      portrait: 'max',
      emotion: 'confused',
      choices: [
        { text: '"How long was I asleep?"', nextNodeId: 'crew_worried' },
        { text: '"They seem... surprisingly dedicated."', nextNodeId: 'crew_sarcastic' },
        { text: '"Wait, I have a crew? Since when?"', nextNodeId: 'crew_confused' },
      ],
    },
    {
      id: 'crew_worried',
      speaker: 'V.A.L.U.',
      text: "Time is a construct, Max! But if you MUST know... long enough for significant compound interest to accumulate on your Opportunity Balance! Productivity waits for no one!",
      portrait: 'valu',
      emotion: 'evasive',
      nextNodeId: 'dive_transition',
    },
    {
      id: 'crew_sarcastic',
      speaker: 'V.A.L.U.',
      text: "They ARE! The Company selects only the MOST loyal crew members. We find that prolonged deep-sea isolation creates WONDERFUL brand ambassadors. Practically family!",
      portrait: 'valu',
      emotion: 'warm',
      nextNodeId: 'dive_transition',
    },
    {
      id: 'crew_confused',
      speaker: 'V.A.L.U.',
      text: "Since your assigned start date, of course! They came with the facility! Think of them as... part of your compensation package. (They're actually leased, but let's keep that between us!)",
      portrait: 'valu',
      emotion: 'conspiratorial',
      nextNodeId: 'dive_transition',
    },
    {
      id: 'dive_transition',
      speaker: 'V.A.L.U.',
      text: "Now for the EXCITING part! When your battery reaches one thousand Energy Units, you can initiate a DEPTH DIVE! This is where REAL value capture happens!",
      portrait: 'valu',
      emotion: 'excited',
      nextNodeId: 'dive_scan',
    },

    // ============================================================================
    // ACT III: DEPTH DIVE & NODES
    // ============================================================================

    {
      id: 'dive_scan',
      speaker: 'V.A.L.U.',
      text: "During a Depth Dive, you'll spend your accumulated energy to SCAN the depths for Data Relay Infrastructure — we call them 'NODES.' Each node generates passive energy income!",
      portrait: 'valu',
      emotion: 'helpful',
      action: 'show_node',
      nextNodeId: 'node_types',
    },
    {
      id: 'node_types',
      speaker: 'V.A.L.U.',
      text: "Nodes come in various tiers! Higher-tier nodes have better Rig Levels, which means... MORE REWARDS! But also slightly elevated risk profiles. The Company believes in balanced portfolios!",
      portrait: 'valu',
      emotion: 'neutral',
      nextNodeId: 'repair_explanation',
    },
    {
      id: 'repair_explanation',
      speaker: 'V.A.L.U.',
      text: "When you encounter a node, you have options! You can REPAIR it to add to your network. Higher Rig Level nodes yield greater rewards, but they also have higher... volatility!",
      portrait: 'valu',
      emotion: 'helpful',
      action: 'hide_visual',
      nextNodeId: 'max_reaction_repair',
    },

    // CHOICE 3: Max's reaction to repair mechanics
    {
      id: 'max_reaction_repair',
      speaker: 'Max',
      text: '...',
      portrait: 'max',
      emotion: 'skeptical',
      choices: [
        { text: '"What kind of volatility are we talking about?"', nextNodeId: 'repair_worried' },
        { text: '"Define \'greater rewards.\'"', nextNodeId: 'repair_interested' },
        { text: '"This sounds like it gets complicated fast."', nextNodeId: 'repair_confused' },
      ],
    },
    {
      id: 'repair_worried',
      speaker: 'V.A.L.U.',
      text: "Nothing to worry about! Just some minor structural instability! I'll explain the FULL details in a moment. Suffice to say, The Company has optimized the risk-reward ratio to be... exciting!",
      portrait: 'valu',
      emotion: 'reassuring',
      nextNodeId: 'extract_intro',
    },
    {
      id: 'repair_interested',
      speaker: 'V.A.L.U.',
      text: "EXCELLENT question! Higher-tier nodes can yield premium assets — rare hardware, valuable crew members, and even CASH equivalents! Your quarterly bonus potential is UNLIMITED!",
      portrait: 'valu',
      emotion: 'enthusiastic',
      nextNodeId: 'extract_intro',
    },
    {
      id: 'repair_confused',
      speaker: 'V.A.L.U.',
      text: "Not at all! It's beautifully simple: find node, repair node, profit! The complexity is all handled by ME. You just make the fun decisions and watch the numbers go up!",
      portrait: 'valu',
      emotion: 'helpful',
      nextNodeId: 'extract_intro',
    },

    // ============================================================================
    // ACT IV: EXTRACT & THE 35% DANGER
    // ============================================================================

    {
      id: 'extract_intro',
      speaker: 'V.A.L.U.',
      text: "Of course, after repairing nodes, you'll want to EXTRACT your hard-earned assets! This secures everything you've collected during your dive. It's the responsible thing to do!",
      portrait: 'valu',
      emotion: 'neutral',
      nextNodeId: 'danger_reveal',
    },
    {
      id: 'danger_reveal',
      speaker: 'V.A.L.U.',
      text: "HOWEVER! I must inform you of one smallrrrr... operational consideration. The Company calls it a 'Spontaneous Unscheduled Asset Liquidation Event.' You might call it... a collapse.",
      portrait: 'valu',
      emotion: 'warning',
      action: 'show_danger_meter',
      nextNodeId: 'danger_35',
    },
    {
      id: 'danger_35',
      speaker: 'V.A.L.U.',
      text: "See this danger meter? It starts at zero and builds during your dive. Once it reaches 35%... well. Let's just say the rig infrastructure becomes 'energetically unstable.' Assets may be... liquidated.",
      portrait: 'valu',
      emotion: 'serious',
      nextNodeId: 'max_reaction_danger',
    },

    // CHOICE 4: Max's reaction to 35% danger
    {
      id: 'max_reaction_danger',
      speaker: 'Max',
      text: '...',
      portrait: 'max',
      emotion: 'alarmed',
      choices: [
        { text: '"35%?! That\'s more than a THIRD!"', nextNodeId: 'danger_scared' },
        { text: '"So I could lose EVERYTHING if I get greedy?"', nextNodeId: 'danger_sarcastic' },
        { text: '"What happens to ME during a... liquidation?"', nextNodeId: 'danger_angry' },
      ],
    },
    {
      id: 'danger_scared',
      speaker: 'V.A.L.U.',
      text: "Technically yes, but 35% is actually QUITE generous! Competitor installations have MUCH higher liquidation thresholds. The Company really DOES care about asset preservation!",
      portrait: 'valu',
      emotion: 'reassuring',
      action: 'hide_visual',
      nextNodeId: 'mitigation_intro',
    },
    {
      id: 'danger_sarcastic',
      speaker: 'V.A.L.U.',
      text: "I prefer 'ambitious!' But yes, greed has consequences. The Company discourages excessive accumulation during single dives. Extract early, extract often! That's our motto!",
      portrait: 'valu',
      emotion: 'warm',
      action: 'hide_visual',
      nextNodeId: 'mitigation_intro',
    },
    {
      id: 'danger_angry',
      speaker: 'V.A.L.U.',
      text: "Oh, YOU'LL be fine! Our emergency ejection protocols are top-tier! You might experience some mild decompression, temporary memory loss, or existential dread, but your CORE value remains intact!",
      portrait: 'valu',
      emotion: 'helpful',
      action: 'hide_visual',
      nextNodeId: 'mitigation_intro',
    },

    // ============================================================================
    // ACT V: MITIGATION & SOCIAL SHARING
    // ============================================================================

    {
      id: 'mitigation_intro',
      speaker: 'V.A.L.U.',
      text: "Now, I know what you're thinking: 'V.A.L.U., how can I REDUCE my liquidation risk?' Excellent question! The Company offers several productivity-enhancing solutions!",
      portrait: 'valu',
      emotion: 'cheerful',
      nextNodeId: 'neural_uplink',
    },
    {
      id: 'neural_uplink',
      speaker: 'V.A.L.U.',
      text: "First, the NEURAL UPLINK! This premium hardware upgrade increases your Rig Stability by 15%! It's available as a rare find during dives. The Company RECOMMENDS acquiring one. Strongly.",
      portrait: 'valu',
      emotion: 'helpful',
      nextNodeId: 'social_intro',
    },
    {
      id: 'social_intro',
      speaker: 'V.A.L.U.',
      text: "And here's my FAVORITE part! The X-Communication Network! By sharing your productivity achievements with the network, you earn a 1.5x VIRAL MULTIPLIER on all extracted assets!",
      portrait: 'valu',
      emotion: 'excited',
      nextNodeId: 'social_details',
    },
    {
      id: 'social_details',
      speaker: 'V.A.L.U.',
      text: "That's right! Simply broadcast your successes to the network and watch your returns multiply! The Company calls it 'Synergistic Social Amplification.' I call it FREE bonus productivity!",
      portrait: 'valu',
      emotion: 'delighted',
      nextNodeId: 'max_reaction_social',
    },

    // CHOICE 5: Max's reaction to social sharing
    {
      id: 'max_reaction_social',
      speaker: 'Max',
      text: '...',
      portrait: 'max',
      emotion: 'skeptical',
      choices: [
        { text: '"So you want me to... advertise for you?"', nextNodeId: 'social_hesitant' },
        { text: '"What\'s the catch?"', nextNodeId: 'social_sarcastic' },
        { text: '"I guess I don\'t really have a choice, do I?"', nextNodeId: 'social_resigned' },
      ],
    },
    {
      id: 'social_hesitant',
      speaker: 'V.A.L.U.',
      text: "Advertiserrrr? Such a CRUDE word! We prefer 'brand ambassador!' And the best part? You don't even have to MEAN it! Just click the button. The algorithm does all the heavy lifting!",
      portrait: 'valu',
      emotion: 'reassuring',
      nextNodeId: 'closing_transition',
    },
    {
      id: 'social_sarcastic',
      speaker: 'V.A.L.U.',
      text: "Catch? There IS no catch! It's a perfectly symbiotic relationship! You share your experiences, The Company gains organic reach, and you get a 1.5x multiplier! EVERYONE wins!",
      portrait: 'valu',
      emotion: 'sincere',
      nextNodeId: 'closing_transition',
    },
    {
      id: 'social_resigned',
      speaker: 'V.A.L.U.',
      text: "I APPRECIATE your pragmatism! The ability to recognize optimal paths is EXACTLY what The Company looks for in its Valued Assets! You're going to fit in SO well here!",
      portrait: 'valu',
      emotion: 'proud',
      nextNodeId: 'closing_transition',
    },

    // ============================================================================
    // ACT VI: CLOSING & TORQUE WRENCH
    // ============================================================================

    {
      id: 'closing_transition',
      speaker: 'V.A.L.U.',
      text: "Well, Max! I think you're FULLY prepared for your new role as a Deep Sea Asset Acquisition Specialist! Do you have any final questions before we begin your productivity journey?",
      portrait: 'valu',
      emotion: 'friendly',
      nextNodeId: 'max_final_question',
    },
    {
      id: 'max_final_question',
      speaker: 'Max',
      text: '...',
      portrait: 'max',
      emotion: 'uncertain',
      choices: [
        { text: '"What\'s that torque wrench for?"', nextNodeId: 'torque_wrench' },
        { text: '"I have... so many questions."', nextNodeId: 'many_questions' },
        { text: '"Let\'s just get started."', nextNodeId: 'lets_begin' },
      ],
    },
    {
      id: 'torque_wrench',
      speaker: 'V.A.L.U.',
      text: "THAT? Oh, that's just standard equipment! For... node maintenance! Yes! Node maintenance! Nothing to worry about! The Company ensures all tools are used for their INTENDED purposes!",
      portrait: 'valu',
      emotion: 'evasive',
      nextNodeId: 'closing_final',
    },
    {
      id: 'many_questions',
      speaker: 'V.A.L.U.',
      text: "Questions are WONDERFUL! But answers are time-consuming, and time is MONEY! I find that on-the-job learning is FAR more efficient. You'll understand everything eventually!",
      portrait: 'valu',
      emotion: 'helpful',
      nextNodeId: 'closing_final',
    },
    {
      id: 'lets_begin',
      speaker: 'V.A.L.U.',
      text: "THAT'S the spirit! A Valued Asset who's eager to start producing! I knew I picked a winner when I saw your neural scan. Let's make some GENERATIONAL WEALTH together!",
      portrait: 'valu',
      emotion: 'excited',
      nextNodeId: 'closing_final',
    },
    {
      id: 'closing_final',
      speaker: 'V.A.L.U.',
      text: "Remember, Max: The Company believes in you! Together, we'll clear that debt, optimize your productivity, and achieve TRUE generational wealth! (Terms and conditions apply. Many of them.)",
      portrait: 'valu',
      emotion: 'warm',
      // No nextNodeId - dialogue ends
    },
  ]
);
