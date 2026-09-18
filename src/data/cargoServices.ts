import type { CargoCapability } from '@/types/content';

/**
 * Cargo services: what SDG Lines carries, as opposed to where it sails.
 *
 * The legacy site mixed these two questions together. "Services" in its
 * navigation meant the five shipping routes, while cold chain and dangerous
 * goods sat as separate top level items alongside them. A learner looking for
 * "can I ship reefer cargo to Beirut" had to know to look in two places.
 *
 * Here, Routes answers where, and Services answers what. Each cargo service
 * links back to the routes that accept it, so either question reaches the same
 * answer.
 */
export interface CargoService {
  slug: string;
  title: string;
  /** The capability in the content model that this page describes. */
  capability: CargoCapability;
  summary: string;
  /** Rendered as paragraphs under "About". */
  description: string[];
  /** Practical points, each a heading and a paragraph. */
  guidance: { heading: string; body: string }[];
  /** Equipment slugs a learner will most likely need. */
  equipmentSlugs: string[];
  /** Colour family used for the page accents. */
  accent: 'sea' | 'eco' | 'signal' | 'navy';
}

export const cargoServices: CargoService[] = [
  {
    slug: 'containers',
    title: 'Container services',
    capability: 'containers',
    accent: 'sea',
    summary:
      'Standard, high cube and open top units moving on every SDG Lines service, from the Balearic shuttle to the Far East rotation.',
    description: [
      'Containerised cargo is the default on the SDG Lines network. Four of the five services carry it, and the equipment is the same everywhere, so a shipment can transfer between services without being unpacked.',
      'The choice a learner has to make is not usually whether to containerise, but which unit to use. That decision turns on whether the cargo runs out of weight or runs out of space first, and it is worth making before looking at a rate.',
    ],
    guidance: [
      {
        heading: 'Start from the cargo, not the box',
        body: 'Work out the volume and the gross weight of the cargo, then find the smallest unit that accommodates both. Choosing a 40 foot unit because it looks like the standard option wastes money on dense cargo that would have hit the payload limit in a 20 foot box.',
      },
      {
        heading: 'Full container load or less than container load',
        body: 'A shipment that does not fill a unit can travel as part of a consolidated load. That is cheaper per cubic metre but slower, because the unit only sails once it is full, and it adds a handling step at both ends.',
      },
      {
        heading: 'The unit is not the whole cost',
        body: 'Terminal handling, documentation and security charges are per unit or per bill of lading, so splitting a shipment across more units multiplies charges that have nothing to do with the freight rate.',
      },
    ],
    equipmentSlugs: ['dry-20', 'dry-40', 'high-cube-40', 'high-cube-45', 'open-top-20'],
  },
  {
    slug: 'roro',
    title: 'Ro-Ro services',
    capability: 'roro',
    accent: 'signal',
    summary:
      'Accompanied and unaccompanied rolling cargo on the Optimed, Westmed and Gimnesias services, loaded by ramp rather than by crane.',
    description: [
      'Ro-Ro stands for roll on, roll off: the cargo is driven or towed aboard rather than lifted. On the SDG Lines network this covers cars and commercial vehicles on the Optimed pure car and truck carriers, and road trailers on the short sea relations.',
      'The advantage is speed of handling. A Ro-Ro call does not wait for a crane window, which is what makes short relations like Barcelona to Palma viable at all.',
    ],
    guidance: [
      {
        heading: 'Accompanied or unaccompanied',
        body: 'An accompanied trailer travels with its driver, who continues the road leg at the other end. An unaccompanied trailer is dropped at the terminal and collected by a different tractor unit. Unaccompanied is cheaper because it does not occupy a passenger berth, but it needs a haulier arranged at the destination.',
      },
      {
        heading: 'Deck space is lane metres, not slots',
        body: 'Ro-Ro capacity is measured in lane metres: the length of deck a unit occupies at standard width. A wider than standard unit consumes more than its own length, in the same way out of gauge container cargo blocks neighbouring slots.',
      },
      {
        heading: 'The trailer may not be yours',
        body: 'On roll trailer shipments the platform is terminal equipment and never leaves the port. Cargo is loaded onto it inside the terminal, which changes who secures the cargo and at what point responsibility transfers.',
      },
    ],
    equipmentSlugs: ['roll-trailer-40', 'roll-trailer-62'],
  },
  {
    slug: 'cold-chain',
    title: 'Cold chain',
    capability: 'reefer',
    accent: 'eco',
    summary:
      'Temperature controlled cargo in reefer containers, with the set point maintained and recorded from loading to delivery.',
    description: [
      'The cold chain is the sequence of temperature controlled steps between the producer and the consumer. A break anywhere in that sequence can spoil the cargo, and the break is often on land rather than at sea.',
      'SDG Lines carries reefer cargo on four of its five services. The teaching value of a cold chain exercise is usually not in the sea leg at all, but in what happens at the terminal and during the inland movement at each end.',
    ],
    guidance: [
      {
        heading: 'The unit maintains, it does not cool',
        body: 'A reefer holds cargo at the temperature it arrives at. It is not designed to bring warm cargo down to the set point, and trying to use it that way both fails and risks damaging the cargo nearest the delivery air. Cargo has to be pre-cooled before loading.',
      },
      {
        heading: 'Airflow decides whether the temperature holds',
        body: 'Cold air is delivered from the floor and returns at the ceiling. Blocking the floor channels or stowing above the load line stops the circulation, and the cargo furthest from the machinery warms up first. A tightly packed reefer is not a well packed one.',
      },
      {
        heading: 'The temperature record is part of the cargo',
        body: 'The datalogger record is what proves the cargo stayed within range. For pharmaceuticals and many food consignments, a shipment that arrived at the correct temperature but cannot prove it may still be rejected.',
      },
    ],
    equipmentSlugs: ['reefer-20', 'reefer-40-hc'],
  },
  {
    slug: 'dangerous-goods',
    title: 'Dangerous goods',
    capability: 'dangerous-goods',
    accent: 'signal',
    summary:
      'Cargo classified under the IMDG Code, accepted on declaration and subject to segregation, stowage and documentation requirements.',
    description: [
      'Dangerous goods are cargo that presents a risk to the vessel, the crew, the other cargo or the environment. They are regulated internationally by the International Maritime Dangerous Goods Code, which classifies them into nine classes and sets out how each must be packed, marked, stowed and separated.',
      'In the simulation, dangerous goods exercises are less about the chemistry and more about the paperwork and the planning: what has to be declared, to whom, by when, and what cannot be stowed next to what.',
    ],
    guidance: [
      {
        heading: 'Declaration comes before booking',
        body: 'Dangerous cargo is accepted on the basis of a declaration giving the UN number, the proper shipping name, the class and the packing group. The carrier decides whether it can be carried, on which vessel and in which position, before a booking is confirmed. A shipment declared late may miss the sailing entirely.',
      },
      {
        heading: 'Segregation is a stowage problem',
        body: 'Some classes may not be stowed together, or must be separated by a minimum distance or by a complete compartment. This constrains where the unit can be placed on the vessel, which is why dangerous goods bookings close earlier than general cargo.',
      },
      {
        heading: 'Undeclared dangerous goods are the serious case',
        body: 'The risk that matters most is cargo that should have been declared and was not, because the whole system of segregation and stowage depends on knowing what is in the box. In an exercise, treat an ambiguous commodity description as a prompt to ask, not as a detail to move past.',
      },
    ],
    equipmentSlugs: ['dry-20', 'dry-40'],
  },
  {
    slug: 'project-cargo',
    title: 'Project cargo',
    capability: 'project-cargo',
    accent: 'navy',
    summary:
      'Out of gauge, heavy lift and breakbulk shipments carried on flat racks and roll trailers where no closed unit will do.',
    description: [
      'Project cargo is anything that will not fit in a standard container: too long, too wide, too tall or too heavy. Transformers, boat hulls, industrial plant and wind components all fall into this category.',
      'Each project shipment is planned individually. There is no standard rate, because the cost depends on how much space the cargo denies to everything around it and on what has to be arranged to load and secure it.',
    ],
    guidance: [
      {
        heading: 'You pay for the space you block, not the space you fill',
        body: 'Cargo overhanging a flat rack makes the neighbouring slots unusable. A shipment that is 30 centimetres too wide can cost as much as one that is a metre too wide, because in both cases the slot beside it is lost.',
      },
      {
        heading: 'Lifting points and weight distribution matter early',
        body: 'How the cargo will be lifted, where the load bears on the flat rack and how it will be secured are questions that have to be answered before the booking, not at the terminal gate. A lashing plan is often required.',
      },
      {
        heading: 'The inland legs are usually the constraint',
        body: 'A cargo that fits on the vessel may still not fit under a bridge on the way to the port. Route surveys for the road legs are part of planning a project shipment, and they frequently determine which port is used.',
      },
    ],
    equipmentSlugs: ['flat-rack-20', 'flat-rack-40', 'roll-trailer-62'],
  },
  {
    slug: 'motorways-of-the-sea',
    title: 'Motorways of the Sea',
    capability: 'motorways-of-the-sea',
    accent: 'eco',
    summary:
      'Short sea relations designed so that freight currently moving by road can move by sea for the long middle leg.',
    description: [
      'Motorways of the Sea is a European transport policy concept: sea routes that work like motorways, with frequent, reliable departures that a haulier can plan around. The aim is modal shift, moving the long middle section of a journey from road to sea while keeping road for the collection and delivery at each end.',
      'For SDG Lines this matters on the Westmed and Gimnesias relations, where the sea leg competes directly with a road route. Comparing the two is one of the more useful exercises the simulation supports, because the answer is rarely obvious and depends on what is being measured.',
    ],
    guidance: [
      {
        heading: 'Compare door to door, not port to port',
        body: 'A sea leg that looks slower than the road route often is not, once the driving time limits, the collection at origin and the delivery at destination are counted. Comparing only the port to port time makes sea look worse than it is.',
      },
      {
        heading: 'Frequency matters more than speed',
        body: 'A daily sailing that takes twelve hours is more useful to a haulier than a twice weekly sailing that takes eight, because the waiting time for the next departure dominates. This is the point of the motorway metaphor.',
      },
      {
        heading: 'Emissions are part of the comparison',
        body: 'Moving the middle leg to sea reduces the emissions of the journey substantially, and that reduction is a legitimate part of the decision alongside cost and time. It is also the reason this policy exists.',
      },
    ],
    equipmentSlugs: ['roll-trailer-40', 'high-cube-45'],
  },
];

export function getCargoServiceBySlug(slug: string): CargoService | undefined {
  return cargoServices.find((service) => service.slug === slug);
}
