/**
 * Prose pages.
 *
 * The explanatory pages of the site - what Port Virtual Lab is, how
 * sustainability is taught here, the legal notice, the accessibility statement -
 * share a shape: a heading, an intro, and a series of sections. Holding them as
 * data rather than as twelve nearly identical Astro files means the content team
 * can edit them without touching a component, and means they cannot drift apart
 * visually.
 */

export type ProseBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; heading?: string; text: string }
  | { type: 'definitions'; items: { term: string; definition: string }[] }
  | { type: 'links'; items: { label: string; href: string; external?: boolean }[] };

export interface ProseSection {
  id: string;
  heading: string;
  blocks: ProseBlock[];
}

export interface ProsePage {
  slug: string;
  /** Where the page lives: 'about', 'resources' or 'root'. */
  group: 'about' | 'resources' | 'root';
  title: string;
  eyebrow: string;
  intro: string;
  description: string;
  sections: ProseSection[];
}

export const prosePages: ProsePage[] = [
  /* ---------------------------------------------------------------------- */
  {
    slug: 'port-virtual-lab',
    group: 'about',
    title: 'Port Virtual Lab',
    eyebrow: 'About',
    intro:
      'The simulation environment that SDG Lines belongs to, and the reason a fictional shipping company has a website at all.',
    description:
      'Port Virtual Lab is the digital simulation environment developed by Escola Europea - Intermodal Transport. SDG Lines is its simulated shipping company.',
    sections: [
      {
        id: 'what-it-is',
        heading: 'What Port Virtual Lab is',
        blocks: [
          {
            type: 'paragraph',
            text: 'Port Virtual Lab is a simulation environment for teaching intermodal transport. It contains a set of companies that behave like the real ones a shipment passes through, and exercises that move cargo between them.',
          },
          {
            type: 'paragraph',
            text: 'The companies are not illustrations in a textbook. They publish their own information, accept their own requests and follow their own rules, so a participant has to deal with each of them on its own terms - which is most of what makes the exercise worth doing.',
          },
          {
            type: 'definitions',
            items: [
              {
                term: 'SDG Lines',
                definition:
                  'The shipping line. Services, vessels, ports, equipment and quotations.',
              },
              {
                term: 'SDG Airlines',
                definition: 'The air cargo carrier, for exercises that compare sea and air.',
              },
              {
                term: 'MEDtrade',
                definition: 'The trading company, which generates the cargo that needs moving.',
              },
              {
                term: 'Playforwarding',
                definition: 'The forwarding game, where participants take the forwarder role.',
              },
            ],
          },
        ],
      },
      {
        id: 'why-simulate',
        heading: 'Why simulate at all',
        blocks: [
          {
            type: 'paragraph',
            text: 'Intermodal transport is hard to teach from a lecture because the difficulty is not in any single fact. Anyone can learn what a bill of lading is in five minutes. What takes practice is holding a dozen constraints at once and noticing which one binds first.',
          },
          {
            type: 'paragraph',
            text: 'A simulation lets a learner meet those constraints in the order they actually arrive, and get them wrong without anyone losing a container. The cost of the mistake is the time it takes to work out what went wrong, which is exactly the cost that produces learning.',
          },
          {
            type: 'callout',
            heading: 'The realism is the teaching method',
            text: 'Every detail that behaves the way the real thing behaves is one more thing the learner does not have to unlearn later. That is why this website is built as a carrier website rather than as a course page about carrier websites.',
          },
        ],
      },
      {
        id: 'access',
        heading: 'Getting access',
        blocks: [
          {
            type: 'paragraph',
            text: 'Port Virtual Lab accounts are issued through Escola Europea courses. This website is open to anyone: it is the public reference that participants use during an exercise, and it does not require a login.',
          },
          {
            type: 'links',
            items: [
              { label: 'Access PVL.ONE', href: 'https://pvl.one', external: true },
              { label: 'Escola Europea courses', href: 'https://escolaeuropea.eu', external: true },
              { label: 'About SDG Lines', href: '/about' },
            ],
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'sustainability',
    group: 'about',
    title: 'Sustainability',
    eyebrow: 'About',
    intro:
      'Why the company is called SDG Lines, and how the Sustainable Development Goals are built into the exercises rather than bolted onto them.',
    description:
      'How sustainability and the UN Sustainable Development Goals are taught through the SDG Lines simulation, including modal shift and the trade-offs between cost, time and emissions.',
    sections: [
      {
        id: 'the-name',
        heading: 'Where the name comes from',
        blocks: [
          {
            type: 'paragraph',
            text: 'SDG stands for Sustainable Development Goals: the seventeen goals adopted by the United Nations in 2015 as a shared agenda to 2030. Naming the simulated carrier after them was a deliberate choice, and it commits the simulation to something.',
          },
          {
            type: 'paragraph',
            text: 'The commitment is that sustainability is not a separate module. A learner comparing two routings is comparing their emissions at the same time as their cost and their transit time, because all three are properties of the same decision.',
          },
        ],
      },
      {
        id: 'modal-shift',
        heading: 'Modal shift, in practice',
        blocks: [
          {
            type: 'paragraph',
            text: 'The single largest lever the simulation offers is modal shift: moving the long middle leg of a journey from road to sea or rail, and keeping road for the collection and delivery at each end.',
          },
          {
            type: 'paragraph',
            text: 'The Westmed and Gimnesias services exist partly so that this comparison can be made concretely. A shipment from Barcelona to Palma can go by road and ferry or as a sea leg with road at each end, and the two options differ in cost, in time, in emissions and in how many driver hours they consume.',
          },
          {
            type: 'callout',
            heading: 'The honest version of the comparison',
            text: 'Sea is not always the answer. For urgent, low volume or badly timed cargo, road can win on every measure the customer cares about. An exercise that only ever produces the sustainable answer is not teaching anyone to make the decision.',
          },
        ],
      },
      {
        id: 'what-we-do-not-claim',
        heading: 'What this site does not claim',
        blocks: [
          {
            type: 'paragraph',
            text: 'SDG Lines publishes no emissions figures, no reduction percentages and no certifications, because it operates no vessels and therefore has nothing to measure. Any such figure would be invented, and an invented sustainability claim is worse than none.',
          },
          {
            type: 'paragraph',
            text: 'Where an exercise needs emissions data, it comes from the methodology your trainer supplies, applied to the distances and modes in the scenario. That is also how it works in industry.',
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'digitalisation',
    group: 'about',
    title: 'Digitalisation',
    eyebrow: 'About',
    intro:
      'Why the simulation is a website rather than a worksheet, and what a learner takes away from using one.',
    description:
      'How digital operations are represented in the SDG Lines simulation: quotations, references, documentation and the habits that transfer to real carrier systems.',
    sections: [
      {
        id: 'why-a-website',
        heading: 'Why a website and not a worksheet',
        blocks: [
          {
            type: 'paragraph',
            text: 'Almost every interaction a forwarder has with a carrier now happens through a screen: checking a schedule, requesting a rate, tracking a box, downloading a document. Someone who has only ever met that information as a handout has to learn the interface as well as the subject the first time they meet a real one.',
          },
          {
            type: 'paragraph',
            text: 'Building the simulation as a working site means the interface is part of what gets learned. A participant who has used this site knows that rotations live under routes, that equipment specifications are their own section, and that local charges are separate from the freight rate - and that structure is common to most carrier websites.',
          },
        ],
      },
      {
        id: 'what-is-digital-here',
        heading: 'What is digital here',
        blocks: [
          {
            type: 'list',
            items: [
              'Quotation requests, which produce a reference that carries through the rest of the exercise',
              'A searchable port directory with filters, rather than a list to scroll',
              'Equipment specifications as structured data, so the same figures appear everywhere they are needed',
              'Route rotations linked to ports, vessels and charges, so a question can be followed from any starting point',
              'Structured content with a recorded review status, so the site can say how reliable each value is',
            ],
          },
        ],
      },
      {
        id: 'limits',
        heading: 'Where the simulation stops',
        blocks: [
          {
            type: 'paragraph',
            text: 'This site has no user accounts, no database and no back office. The quotation form generates its reference in the browser and sends nothing anywhere. Tracking is illustrative rather than live.',
          },
          {
            type: 'paragraph',
            text: 'Those limits are deliberate. Every piece of infrastructure added here is infrastructure a training centre has to maintain, secure and keep compliant, and none of it would teach a participant anything the current version does not.',
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'quality',
    group: 'about',
    title: 'Quality and content review',
    eyebrow: 'About',
    intro:
      'How the information on this site is checked, and how to tell how far a given value has been checked.',
    description:
      'The content review process behind the SDG Lines website: verification status, review dates and how to report an error.',
    sections: [
      {
        id: 'status',
        heading: 'Every record carries its status',
        blocks: [
          {
            type: 'paragraph',
            text: 'A visitor cannot tell by looking whether a number on this site is a real world fact, a value the product owner defined for the simulation, or something nobody has confirmed. So each record states which it is, and the page shows that statement rather than hiding it in a spreadsheet.',
          },
          {
            type: 'definitions',
            items: [
              {
                term: 'Verified',
                definition: 'Checked against its source and approved. Published without a notice.',
              },
              {
                term: 'Inherited',
                definition:
                  'Carried over from the previous website and not yet reviewed. Published with a notice.',
              },
              {
                term: 'Needs review',
                definition:
                  'Known to be missing, disputed or proposed. Published with a notice saying so.',
              },
            ],
          },
        ],
      },
      {
        id: 'sources',
        heading: 'Where values come from',
        blocks: [
          {
            type: 'definitions',
            items: [
              {
                term: 'Real world',
                definition:
                  'Verifiable outside the simulation: a country, a geographic position, an ISO container dimension.',
              },
              {
                term: 'Legacy site',
                definition: 'Copied from sdglines.com during the audit of 18 September 2026.',
              },
              {
                term: 'Simulation design',
                definition:
                  'Defined by the product owner for teaching purposes: call signs, rotations, agency conventions.',
              },
              {
                term: 'Derived',
                definition: 'Calculated from other verified values by a documented rule.',
              },
            ],
          },
        ],
      },
      {
        id: 'gaps',
        heading: 'What happens when something is unknown',
        blocks: [
          {
            type: 'paragraph',
            text: 'The field is left empty and the page shows "To be confirmed". It is never filled with a plausible estimate. A learner quoting an estimate in an assessed exercise would have no way of knowing it was one.',
          },
          {
            type: 'paragraph',
            text: 'The largest known gaps at present are the technical particulars of the fourteen vessels, the service frequencies and transit times, and the arrival charge amounts. None of these were published on the previous website.',
          },
        ],
      },
      {
        id: 'reporting',
        heading: 'Reporting an error',
        blocks: [
          {
            type: 'paragraph',
            text: 'If a value is wrong, or is presented as settled when it is not, that is a defect worth reporting. Write to info@escolaeuropea.eu with the page address and what you believe the correct value to be.',
          },
          {
            type: 'links',
            items: [
              { label: 'About SDG Lines', href: '/about' },
              { label: 'Accessibility statement', href: '/accessibility' },
            ],
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'legal',
    group: 'root',
    title: 'Legal notice',
    eyebrow: 'Legal',
    intro: 'Ownership, trademarks, licensing and the limits of what this website represents.',
    description:
      'Legal notice for the SDG Lines website: ownership, trademarks, copyright, licensing and the educational simulation disclaimer.',
    sections: [
      {
        id: 'nature',
        heading: 'Nature of this website',
        blocks: [
          {
            type: 'callout',
            heading: 'SDG Lines is an educational simulation',
            text: 'It does not provide real transport services. Nothing on this website constitutes a commercial offer, a contract of carriage, a quotation, a tariff or professional advice of any kind.',
          },
          {
            type: 'paragraph',
            text: 'The vessels described here are not registered with the International Maritime Organization or with any flag state. The IMO numbers, MMSI identifiers and call signs shown belong to the simulation and correspond to no real vessel. Agency contact details follow a naming convention for teaching purposes and are not monitored mailboxes.',
          },
        ],
      },
      {
        id: 'ownership',
        heading: 'Ownership',
        blocks: [
          {
            type: 'paragraph',
            text: 'This website is owned and operated by Escola Europea de Short Sea Shipping AEIE, Moll de Barcelona - Terminal Drassanes, 08039 Barcelona, Spain.',
          },
          {
            type: 'paragraph',
            text: 'The Port Virtual Lab name and mark, along with SDG Lines, SDG Airlines, MEDtrade and Playforwarding, are owned by Escola Europea de Short Sea Shipping AEIE.',
          },
        ],
      },
      {
        id: 'copyright',
        heading: 'Copyright and licensing',
        blocks: [
          {
            type: 'paragraph',
            text: 'All rights reserved. Unauthorised use, reproduction or distribution is prohibited and may result in legal action.',
          },
          {
            type: 'paragraph',
            text: 'This work by Escola Europea - Intermodal Transport is licensed under a Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.',
          },
          {
            type: 'links',
            items: [
              {
                label: 'Read the licence',
                href: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
                external: true,
              },
            ],
          },
        ],
      },
      {
        id: 'third-party',
        heading: 'Third party names',
        blocks: [
          {
            type: 'paragraph',
            text: 'Port names, country names and UN/LOCODE identifiers are used descriptively to identify real geographic locations. Their use here implies no association with, or endorsement by, any port authority, terminal operator or public body.',
          },
          {
            type: 'paragraph',
            text: 'The vessels are named after real historical people. The biographies are written from public biographical record and are included as part of the educational purpose of the simulation.',
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'privacy',
    group: 'root',
    title: 'Privacy',
    eyebrow: 'Legal',
    intro: 'What this website collects, which is almost nothing, and why.',
    description:
      'Privacy information for the SDG Lines website: what data is collected, how forms work and what third party requests the site makes.',
    sections: [
      {
        id: 'summary',
        heading: 'The short version',
        blocks: [
          {
            type: 'callout',
            heading: 'This site collects no personal data',
            text: 'There are no accounts, no cookies set by this site, no analytics and no trackers. Nothing you type into a form on this site is transmitted anywhere.',
          },
        ],
      },
      {
        id: 'forms',
        heading: 'Forms',
        blocks: [
          {
            type: 'paragraph',
            text: 'The quotation request form runs entirely in your browser. It validates what you enter, generates a quotation reference from the shipment details and shows the result on the page. No request is sent to any server and nothing is stored.',
          },
          {
            type: 'paragraph',
            text: 'The form does not ask for your name, e-mail address, telephone number or company, because the simulation does not need them. Please do not enter personal details in the free text fields.',
          },
        ],
      },
      {
        id: 'third-parties',
        heading: 'Requests to other services',
        blocks: [
          {
            type: 'paragraph',
            text: 'Fonts are served from this site rather than from a font provider, so displaying a page does not disclose your IP address to a third party. The interactive map loads map tiles from OpenStreetMap only when you open the map page, and only then.',
          },
          {
            type: 'paragraph',
            text: 'Links marked as opening in a new tab lead to other websites, including PVL.ONE and escolaeuropea.eu. Those sites have their own privacy practices.',
          },
        ],
      },
      {
        id: 'hosting',
        heading: 'Hosting',
        blocks: [
          {
            type: 'paragraph',
            text: 'The site is served as static files by GitHub Pages. As with any web host, the host processes the technical information needed to deliver a page, such as your IP address and the page requested. Escola Europea does not receive or retain that information.',
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'accessibility',
    group: 'root',
    title: 'Accessibility statement',
    eyebrow: 'Legal',
    intro:
      'What this site commits to, what has been tested, and what to do if something is unusable.',
    description:
      'Accessibility statement for the SDG Lines website: conformance with WCAG 2.2 AA, how the site was tested and how to report a barrier.',
    sections: [
      {
        id: 'commitment',
        heading: 'Our commitment',
        blocks: [
          {
            type: 'paragraph',
            text: 'This website is built to meet the Web Content Accessibility Guidelines version 2.2 at level AA. That commitment matters more here than on a marketing site, because this is a reference that learners use under time pressure during a class: anything that is hard to operate costs them the exercise, not just a page view.',
          },
        ],
      },
      {
        id: 'measures',
        heading: 'What the site does',
        blocks: [
          {
            type: 'list',
            items: [
              'Every page has one main heading and a heading structure that follows the content',
              'The whole site can be operated from the keyboard, including the section menus, which open on click rather than on hover and close with Escape',
              'A skip link jumps past the navigation to the main content',
              'Focus indicators are visible on both the white pages and the navy header',
              'Route and port information is always available as a list or a table, never only on a map',
              'Form errors are listed in a summary that is announced, and each message says what to do rather than only what is wrong',
              'Filter results are announced through a live region as the count changes',
              'Animation is disabled when the operating system requests reduced motion',
              'Interactive controls are at least 44 by 44 pixels',
              'Colour is never the only way information is conveyed',
            ],
          },
        ],
      },
      {
        id: 'maps',
        heading: 'Maps and charts',
        blocks: [
          {
            type: 'callout',
            heading: 'A map is never the only route to the information',
            text: 'The network chart on the home page and the route pages is a supporting illustration. Every rotation it draws is also published as an ordered table, and every port on it has its own page. The interactive map at /ports/map sits alongside the port directory rather than replacing it.',
          },
        ],
      },
      {
        id: 'known-issues',
        heading: 'Known limitations',
        blocks: [
          {
            type: 'list',
            items: [
              'The interactive map uses a third party mapping library whose keyboard support is limited. The port directory provides the same information in an accessible form.',
              'Automated checks cover a sample of pages rather than all of them. Manual keyboard and screen reader testing has been carried out on the home page, a route page, a port page, the equipment catalogue and the quotation form.',
            ],
          },
        ],
      },
      {
        id: 'feedback',
        heading: 'If something does not work',
        blocks: [
          {
            type: 'paragraph',
            text: 'Please write to info@escolaeuropea.eu with the page address, what you were trying to do, and the browser and assistive technology you were using. A barrier that stops someone completing an exercise is treated as a defect, not as a feature request.',
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'documentation',
    group: 'resources',
    title: 'Transport documentation',
    eyebrow: 'Resources',
    intro: 'The documents a shipment travels with, what each one does and who issues it.',
    description:
      'The main transport documents used in maritime shipping: bill of lading, sea waybill, packing list, commercial invoice and dangerous goods declaration.',
    sections: [
      {
        id: 'why',
        heading: 'Why the paperwork matters',
        blocks: [
          {
            type: 'paragraph',
            text: 'A container that arrives without the right documents has not really arrived. It sits in the terminal accruing storage and demurrage while somebody works out who is entitled to collect it. Most of the expensive problems in a shipment are document problems.',
          },
        ],
      },
      {
        id: 'documents',
        heading: 'The main documents',
        blocks: [
          {
            type: 'definitions',
            items: [
              {
                term: 'Bill of lading',
                definition:
                  'Issued by the carrier. Receipt for the cargo, evidence of the contract of carriage, and a document of title: whoever holds the original can claim the goods.',
              },
              {
                term: 'Sea waybill',
                definition:
                  'Like a bill of lading but not a document of title. Faster, because no original has to travel, but the cargo can only be released to the named consignee.',
              },
              {
                term: 'Commercial invoice',
                definition:
                  'Issued by the seller. States what was sold, to whom and for how much. The basis for customs valuation.',
              },
              {
                term: 'Packing list',
                definition:
                  'States what is in each package and what it weighs. Used at customs inspection and to check the shipment on arrival.',
              },
              {
                term: 'Certificate of origin',
                definition:
                  'States where the goods were produced. Determines the duty rate and whether a trade agreement applies.',
              },
              {
                term: 'Dangerous goods declaration',
                definition:
                  'Issued by the shipper. States the UN number, proper shipping name, class and packing group. Must be made before the booking is confirmed.',
              },
            ],
          },
        ],
      },
      {
        id: 'common-errors',
        heading: 'Where it goes wrong',
        blocks: [
          {
            type: 'list',
            items: [
              'The description on the bill of lading does not match the invoice, so customs hold the shipment',
              'The original bill of lading is still in the post when the vessel arrives',
              'The consignee on the document is not the party that turns up to collect',
              'Dangerous cargo is described in general terms and the declaration is made too late',
              'Gross and net weights are transposed, which is caught at the weighbridge and not before',
            ],
          },
        ],
      },
      {
        id: 'related',
        heading: 'Related',
        blocks: [
          {
            type: 'links',
            items: [
              { label: 'Arrival charges', href: '/resources/arrival-charges' },
              { label: 'Dangerous goods', href: '/services/dangerous-goods' },
              { label: 'Request a quotation', href: '/quote' },
            ],
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'customer-service',
    group: 'resources',
    title: 'Customer service',
    eyebrow: 'Resources',
    intro: 'Who to contact, and what this simulation can and cannot answer.',
    description:
      'How to get help with the SDG Lines simulation website, and where to direct questions about Port Virtual Lab exercises.',
    sections: [
      {
        id: 'within-an-exercise',
        heading: 'If you are inside an exercise',
        blocks: [
          {
            type: 'paragraph',
            text: 'Your trainer is the customer service desk. Rates, free time, tariffs and anything that affects how your exercise is assessed are set by them, not by this website.',
          },
          {
            type: 'callout',
            heading: 'The agency addresses are not mailboxes',
            text: 'The city.country@sdglines.com addresses on the port pages follow a convention so that a learner can work out an office address from a port name. Nobody reads them.',
          },
        ],
      },
      {
        id: 'about-the-site',
        heading: 'If something on this site is wrong',
        blocks: [
          {
            type: 'paragraph',
            text: 'Write to info@escolaeuropea.eu with the page address and what you think is wrong. Errors of fact, broken links and anything presented as confirmed when it is not are all worth reporting.',
          },
        ],
      },
      {
        id: 'access',
        heading: 'If you cannot get into PVL.ONE',
        blocks: [
          {
            type: 'paragraph',
            text: 'Port Virtual Lab accounts are issued through Escola Europea courses. This website needs no account; if you are being asked for one here, something has gone wrong and it is worth reporting.',
          },
          {
            type: 'links',
            items: [
              { label: 'Access PVL.ONE', href: 'https://pvl.one', external: true },
              { label: 'Escola Europea', href: 'https://escolaeuropea.eu', external: true },
            ],
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'downloads',
    group: 'resources',
    title: 'Downloads',
    eyebrow: 'Resources',
    intro: 'Reference files for use in exercises.',
    description:
      'Downloadable reference material for SDG Lines exercises, including vessel data sheets and equipment specifications.',
    sections: [
      {
        id: 'available',
        heading: 'What is available',
        blocks: [
          {
            type: 'callout',
            heading: 'No files are published yet',
            text: 'The legacy website offered vessel technical data sheets, but the underlying particulars were never published and the files could not be recovered during the audit. Rather than publish a data sheet with invented figures, this section stays empty until the product owner supplies the source data.',
          },
          {
            type: 'paragraph',
            text: 'In the meantime, every figure the simulation does have is published on the site itself and can be printed from the page. The equipment catalogue carries full internal dimensions, tare weights and payloads; the fleet register carries the identity data for all fourteen vessels.',
          },
          {
            type: 'links',
            items: [
              { label: 'Equipment catalogue', href: '/equipment' },
              { label: 'Fleet register', href: '/fleet' },
              { label: 'Arrival charges', href: '/resources/arrival-charges' },
            ],
          },
        ],
      },
      {
        id: 'planned',
        heading: 'What is planned',
        blocks: [
          {
            type: 'list',
            items: [
              'Vessel technical data sheets, once particulars are confirmed for the fourteen vessels',
              'A printable network schedule, once frequencies and transit times are confirmed',
              'An arrival charge schedule, once the tariff to be used in exercises is set',
              'A packing and securing checklist',
            ],
          },
          {
            type: 'paragraph',
            text: 'Each of these depends on data that does not yet exist rather than on work that has not been done. The gaps are listed in the project documentation so that they can be closed in one pass.',
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'news',
    group: 'resources',
    title: 'News and updates',
    eyebrow: 'Resources',
    intro: 'What has changed in the simulation, and when.',
    description:
      'Changes to the SDG Lines simulation and website, so that trainers can tell whether an exercise written earlier still matches the site.',
    sections: [
      {
        id: 'purpose',
        heading: 'What this page is for',
        blocks: [
          {
            type: 'paragraph',
            text: 'A trainer who wrote an exercise six months ago needs to know whether the site still says what it said then. This page records changes to the simulation itself: routes, ports, vessels, equipment and charges.',
          },
          {
            type: 'paragraph',
            text: 'It is not a news feed about the shipping industry. The previous website carried three articles dated October 2020 under this heading, which by 2026 told a visitor mainly that nobody was maintaining it.',
          },
        ],
      },
      {
        id: 'changes',
        heading: 'September 2026: the site was rebuilt',
        blocks: [
          {
            type: 'paragraph',
            text: 'The website was redesigned and rebuilt from the audited content of the previous site. Trainers with exercises written against the old site should check the following.',
          },
          {
            type: 'list',
            items: [
              'Addresses changed. Routes now live under /routes, ports under /ports and vessels under /fleet. Old links redirect where the destination is unambiguous.',
              'Route rotations are published for the first time. They are proposals awaiting confirmation and are labelled as such on each route page.',
              'Equipment now carries internal dimensions, tare weights and payloads, which the previous site did not publish.',
              'Arrival charges are published as a catalogue of charge types. No amounts are published; the tariff is set by the trainer.',
              'The customer testimonials were removed. They named individuals who do not exist and read as genuine social proof for a company that carries no cargo.',
              'Two vessel names were corrected: Carolina Herschel to Caroline Herschel, and Merce Rodoreda to Mercè Rodoreda. Both are pending confirmation.',
              'Port name spellings were corrected: Pireaus to Piraeus, Valleta to Valletta, Felixtowe to Felixstowe, Abu Dahbi to Abu Dhabi, Algier to Algiers and Danietta to Damietta.',
            ],
          },
          {
            type: 'links',
            items: [
              { label: 'How content is reviewed', href: '/about/quality' },
              { label: 'About SDG Lines', href: '/about' },
            ],
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'tracking',
    group: 'resources',
    title: 'Track a shipment',
    eyebrow: 'Resources',
    intro: 'How tracking works inside the simulation, and why there is no live tracker here.',
    description:
      'Shipment tracking in the SDG Lines simulation: how to follow a shipment during a Port Virtual Lab exercise.',
    sections: [
      {
        id: 'no-live-tracking',
        heading: 'There is no live tracker on this site',
        blocks: [
          {
            type: 'paragraph',
            text: 'A tracking page needs a system behind it that knows where shipments are. SDG Lines has no shipments, so a tracker here could only ever show invented movements, and an invented movement in an assessed exercise is a trap rather than a feature.',
          },
          {
            type: 'paragraph',
            text: 'Where an exercise involves tracking, the shipment status is maintained inside Port Virtual Lab by your trainer, and that is where to look for it.',
          },
        ],
      },
      {
        id: 'what-to-know',
        heading: 'What tracking actually tells you',
        blocks: [
          {
            type: 'paragraph',
            text: 'Carrier tracking reports events, not positions. A container is not continuously located; it is recorded at the points where something happens to it.',
          },
          {
            type: 'definitions',
            items: [
              {
                term: 'Gate in',
                definition:
                  'The unit entered the terminal. The clock on free time usually starts here.',
              },
              {
                term: 'Loaded',
                definition: 'The unit was lifted aboard a named vessel and voyage.',
              },
              {
                term: 'Discharged',
                definition:
                  'The unit came off at a port, which may be a transhipment port rather than the destination.',
              },
              {
                term: 'Gate out',
                definition:
                  'The unit left the destination terminal. Demurrage stops and detention starts.',
              },
              {
                term: 'Empty returned',
                definition: 'The unit came back to the carrier. Detention stops.',
              },
            ],
          },
          {
            type: 'callout',
            heading: 'Silence is not nothing',
            text: 'A long gap between events usually means a transhipment or a delay, not a lost box. Reading the gap is most of the skill.',
          },
        ],
      },
      {
        id: 'related',
        heading: 'Related',
        blocks: [
          {
            type: 'links',
            items: [
              { label: 'Arrival charges', href: '/resources/arrival-charges' },
              { label: 'Request a quotation', href: '/quote' },
              { label: 'Access PVL.ONE', href: 'https://pvl.one', external: true },
            ],
          },
        ],
      },
    ],
  },
];

export function getProsePage(group: ProsePage['group'], slug: string): ProsePage | undefined {
  return prosePages.find((page) => page.group === group && page.slug === slug);
}

export function getProsePagesByGroup(group: ProsePage['group']): ProsePage[] {
  return prosePages.filter((page) => page.group === group);
}
