/**
 * Updates to the simulation.
 *
 * Structured rather than prose, because this content has two jobs that a single
 * written page cannot do well: it has to be readable in full on the updates
 * page, and it has to be previewable on the home page with the most recent
 * items first.
 *
 * What this is NOT: a news feed about the shipping industry. The previous
 * website carried three articles dated October 2020 under the heading "News",
 * which by 2026 mainly demonstrated that nobody was maintaining it. What a
 * trainer actually needs to know is whether an exercise written six months ago
 * still matches what the site says today.
 */
export type UpdateKind = 'release' | 'content' | 'correction';

export interface Update {
  id: string;
  /** ISO 8601 date (YYYY-MM-DD). */
  date: string;
  kind: UpdateKind;
  title: string;
  /** One or two sentences. Shown in the home page preview. */
  summary: string;
  /** The detail, shown on the updates page. */
  details?: string[];
  /** What a trainer should check in an existing exercise. */
  actionForTrainers?: string;
  link?: { label: string; href: string };
}

export const UPDATE_KIND_LABELS: Record<UpdateKind, string> = {
  release: 'Release',
  content: 'Content',
  correction: 'Correction',
};

/** Newest first. Keep this ordering: the home page previews the first three. */
export const updates: Update[] = [
  {
    id: 'brand-2026-09',
    date: '2026-09-18',
    kind: 'release',
    title: 'The site now uses the real SDG Lines brand',
    summary:
      'Colours are sampled from the logo artwork rather than estimated, the logo itself appears across the site, and the home page carries a photograph.',
    details: [
      'The three brand colours - cyan, navy and green - were taken from the logo file itself. The previous palette came from the project brief, which described a navy and red identity that the logo does not actually contain.',
      'Red survives only as a functional colour for form errors and the simulation notice, kept separate from the brand so that a warning never looks like a link.',
      'The header is white because the logo needs it: the mark contains a navy swoosh that disappears against a navy background.',
    ],
    actionForTrainers:
      'Nothing to check. No content, figure or address changed in this release, only the appearance.',
  },
  {
    id: 'rebuild-2026-09',
    date: '2026-09-18',
    kind: 'release',
    title: 'The website was rebuilt',
    summary:
      'A complete redesign, rebuilt from an audit of the previous site. Addresses changed, route rotations are published for the first time, and the customer testimonials were removed.',
    details: [
      'Routes now live under /routes, ports under /ports and vessels under /fleet. Old addresses redirect automatically wherever the destination is unambiguous.',
      'Each route page publishes a full rotation as an ordered table. The previous route pages published no rotation, no frequency and no transit time at all.',
      'Equipment now carries internal dimensions, tare weights and payloads, which the previous site did not publish.',
      'Arrival charges are published as a catalogue of charge types with no amounts. The previous Arrival Charges link redirected to the home page and no schedule existed to migrate.',
      'The three customer testimonials were removed. They attributed praise to named individuals for a company that carries no cargo.',
      'The three news articles from October 2020 were archived. They described Escola Europea activities rather than the simulation.',
    ],
    actionForTrainers:
      'Check any exercise written against the old site: addresses have changed, and route rotations now exist where they previously did not.',
    link: { label: 'What changed, in full', href: '/resources/news' },
  },
  {
    id: 'spelling-2026-09',
    date: '2026-09-18',
    kind: 'correction',
    title: 'Vessel and port name spellings corrected',
    summary:
      'Two vessel names and six port names were corrected against their real-world sources. All are pending confirmation by the product owner.',
    details: [
      'Vessels: Carolina Herschel became Caroline Herschel, after the astronomer; Merce Rodoreda became Mercè Rodoreda, the Catalan spelling.',
      'Ports: Pireaus became Piraeus, Valleta became Valletta, Felixtowe became Felixstowe, Abu Dahbi became Abu Dhabi, Algier became Algiers, and Danietta became Damietta.',
      'The vessel class recorded as "Reffles" on four ships is left as published and flagged. Unlike a person or a place, it cannot be checked against an external source.',
    ],
    actionForTrainers:
      'If an exercise names a vessel or port in writing, check the spelling matches. The old addresses still redirect.',
    link: { label: 'Outstanding items', href: '/about/quality' },
  },
];

/** The most recent updates, newest first. */
export function getRecentUpdates(count: number): Update[] {
  return updates.slice(0, count);
}
