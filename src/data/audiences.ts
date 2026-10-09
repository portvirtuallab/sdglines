/**
 * Who the site is for.
 *
 * The project brief defines three distinct audiences with genuinely different
 * needs, and until now the site addressed all of them in the same voice. A
 * learner mid-exercise, a trainer preparing a case and someone evaluating Port
 * Virtual Lab for their institution arrive wanting different things and should
 * not have to work out which parts apply to them.
 *
 * The pattern is borrowed from commercial freight platforms, which segment
 * their home page by buyer type. What is NOT borrowed is the framing: those
 * segments exist to qualify a sales lead. These exist to shorten the path to
 * the right page.
 */
export interface Audience {
  id: string;
  title: string;
  /** One line naming the person, not the role in the abstract. */
  summary: string;
  /** What this audience can do, each pointing at a real page. */
  points: { label: string; href: string }[];
  /** The single most useful destination for this audience. */
  action: { label: string; href: string; external?: boolean };
  accent: 'signal' | 'sea' | 'eco';
}

export const audiences: Audience[] = [
  {
    id: 'learners',
    title: 'Students and course participants',
    summary:
      'You are in the middle of an exercise and need a figure, a rotation or a unit specification now.',
    points: [
      { label: 'Find which service reaches a port', href: '/routes' },
      { label: 'Check what fits in a container', href: '/equipment' },
      { label: 'See what is charged on arrival', href: '/resources/arrival-charges' },
      { label: 'Build a simulated quotation', href: '/request-a-quote' },
    ],
    action: { label: 'Start from the task you need', href: '/#tasks' },
    accent: 'signal',
  },
  {
    id: 'trainers',
    title: 'Trainers and teachers',
    summary:
      'You are preparing a case and need to know what the site says, and how far it has been confirmed.',
    points: [
      { label: 'See what changed and when', href: '/resources/news' },
      { label: 'Check how content is reviewed', href: '/about/quality' },
      { label: 'Read the transport documents reference', href: '/resources/documentation' },
      { label: 'Use the network map in class', href: '/ports/map' },
    ],
    action: { label: 'How the content is verified', href: '/about/quality' },
    accent: 'sea',
  },
  {
    id: 'institutions',
    title: 'Institutions evaluating Port Virtual Lab',
    summary:
      'You are deciding whether simulation-based learning fits your programme, and want to see the substance.',
    points: [
      { label: 'Understand what the simulation is', href: '/about' },
      { label: 'See how it fits Port Virtual Lab', href: '/about/port-virtual-lab' },
      { label: 'Read how sustainability is taught', href: '/about/sustainability' },
      { label: 'Review the accessibility commitment', href: '/accessibility' },
    ],
    action: { label: 'Talk to Escola Europea', href: 'https://escolaeuropea.eu', external: true },
    accent: 'eco',
  },
];
