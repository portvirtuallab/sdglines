/**
 * Frequently asked questions.
 *
 * These are not invented. They are the questions a trainer has to answer out
 * loud in the room, which is the clearest signal that the site failed to answer
 * them: "is this a real company", "why does it say to be confirmed", "where do
 * I get the price".
 *
 * Answering them on the home page does two jobs. It saves the trainer the
 * interruption, and it puts the simulation disclaimer in front of someone who
 * arrived from a search engine and has not read anything else.
 *
 * The answers are rendered as FAQPage structured data as well as on the page,
 * so a search result for "is SDG Lines a real shipping company" can carry the
 * correct answer rather than a guess.
 */
export interface FaqItem {
  question: string;
  /** Plain text. Rendered on the page and emitted as structured data. */
  answer: string;
  /** Where to read more, when there is more. */
  link?: { label: string; href: string };
}

export const faq: FaqItem[] = [
  {
    question: 'Is SDG Lines a real shipping company?',
    answer:
      'No. SDG Lines is an educational simulation operated by Escola Europea - Intermodal Transport. It owns no vessels, moves no cargo and holds no licences. The IMO numbers, call signs and agency addresses on this site belong to the simulation and correspond to nothing in the real world. You cannot book a shipment here.',
    link: { label: 'What SDG Lines is, and is not', href: '/about' },
  },
  {
    question: 'Do I need an account to use this site?',
    answer:
      'No. Everything on this website is open: routes, ports, the fleet register, equipment specifications, arrival charges and the quotation form. Port Virtual Lab itself needs an account, which is issued through an Escola Europea course, but you do not need one to look anything up here.',
  },
  {
    question: 'Why do so many figures say "To be confirmed"?',
    answer:
      'Because nobody has confirmed them yet, and the alternative would be filling the gap with something plausible. A learner quoting an invented transit time in an assessed exercise would have no way of knowing it was invented. Every record on the site states where its values came from and how far they have been reviewed.',
    link: { label: 'How content is reviewed', href: '/about/quality' },
  },
  {
    question: 'Where do I get the freight rate and the charge amounts?',
    answer:
      'From your trainer. Rates and tariffs in the simulation are set per exercise, which is also how a real tariff works: negotiated and dated rather than a fixed property of a port. The arrival charges page explains what each charge covers and who pays it, which is the part that transfers.',
    link: { label: 'Arrival charges explained', href: '/resources/arrival-charges' },
  },
  {
    question: 'Does the quotation tool send my details anywhere?',
    answer:
      'No. It runs entirely in your browser, works out the price and the reference there, and shows the result on the page. Nothing is transmitted or stored. It does ask for your name, e-mail address and the organisation you are taking part as, because those appear on the quotation itself, but that information never leaves your device.',
    link: { label: 'How this site handles data', href: '/privacy' },
  },
  {
    question: 'Can I track a shipment here?',
    answer:
      'Not on this site. A tracker needs a system that knows where shipments are, and SDG Lines has none, so it could only ever show invented movements. Shipment status during an exercise is maintained inside Port Virtual Lab by your trainer.',
    link: { label: 'What tracking events mean', href: '/resources/tracking' },
  },
  {
    question: 'The old website had a page that has moved. Where is it?',
    answer:
      'The site was rebuilt in 2026 and the addresses changed. Old links redirect automatically wherever the destination is unambiguous, and the search covers every port, route, vessel, container type and charge. If you had an exercise written against the old site, the updates page lists what changed.',
    link: { label: 'What changed in the rebuild', href: '/resources/news' },
  },
  {
    question: 'Can we use this with our own students?',
    answer:
      'The website is public and free to consult. Running exercises inside Port Virtual Lab goes through Escola Europea, which issues the accounts and provides the training material. The content is published under a Creative Commons licence that permits sharing with attribution for non-commercial use.',
    link: { label: 'About Port Virtual Lab', href: '/about/port-virtual-lab' },
  },
];
