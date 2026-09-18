import type { EquipmentCategory } from '@/types/content';

/**
 * The equipment families shown as pages.
 *
 * These do not map one to one onto the model categories: open top units are
 * containers as far as a learner is concerned, so they appear on the containers
 * page rather than getting a page of their own.
 *
 * Kept in its own module because Astro hoists getStaticPaths out of the
 * component scope, so anything it reads has to be imported rather than declared
 * in the page frontmatter.
 */
export interface EquipmentFamily {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  categories: EquipmentCategory[];
  guidance: { heading: string; body: string }[];
}

export const families: EquipmentFamily[] = [
  {
    slug: 'containers',
    title: 'Containers',
    eyebrow: 'Equipment',
    intro:
      'Closed steel units for general cargo, plus the open top variant for cargo that has to be craned in from above.',
    categories: ['container', 'open-top'],
    guidance: [
      {
        heading: 'Weight or volume, not both',
        body: 'A container fills up in one of two ways. Dense cargo reaches the maximum payload while the box still looks half empty; light cargo fills the box long before the payload matters. Work out which limit applies before choosing a size, because the answer decides whether a 20 foot or a 40 foot unit is cheaper for the same shipment.',
      },
      {
        heading: 'Gross weight is tare plus payload',
        body: 'The figure a terminal and a road haulier care about is the gross weight of the loaded unit, which is the tare of the empty container plus the cargo. Road weight limits apply to that total, and they are often stricter than the container rating.',
      },
      {
        heading: 'High cube is height, not length',
        body: 'A 40 foot high cube is the same length and width as a standard 40 foot unit, with about 30 centimetres more internal height. That is enough for an extra layer of pallets, and enough to cause a problem under a low bridge or in an older warehouse door.',
      },
    ],
  },
  {
    slug: 'reefers',
    title: 'Reefers and the cold chain',
    eyebrow: 'Equipment',
    intro:
      'Insulated units with integral refrigeration machinery, for cargo that has to arrive within a temperature range rather than simply arrive.',
    categories: ['reefer'],
    guidance: [
      {
        heading: 'A reefer holds less than the dry box of the same size',
        body: 'The refrigeration machinery sits inside the unit at one end, and the insulation takes thickness from every wall. A 20 foot reefer has roughly half a metre less internal length and about five cubic metres less capacity than a 20 foot dry container. Plan the load on the reefer figures, never on the dry ones.',
      },
      {
        heading: 'Air has to be able to move',
        body: 'Reefers deliver air from the floor and return it at the ceiling. Cargo is stowed so that air can travel up through and around it, which means not blocking the floor channels and not stacking above the red load line. A perfectly packed reefer that blocks the airflow will not hold its temperature.',
      },
      {
        heading: 'Set point is not the same as cargo temperature',
        body: 'The machinery controls the temperature of the air it delivers, not of the cargo. Cargo loaded warm will not be cooled down to the set point by the unit; it has to be at temperature before it goes in. In an exercise, that distinction is often the point of the case.',
      },
    ],
  },
  {
    slug: 'flat-racks',
    title: 'Flat racks',
    eyebrow: 'Equipment',
    intro:
      'Container floors with fixed or collapsible end walls, used when the cargo is wider, taller or heavier than any closed unit allows.',
    categories: ['flat-rack'],
    guidance: [
      {
        heading: 'Out of gauge means extra slots',
        body: 'Cargo that overhangs a flat rack takes space from the units around it. A shipment one metre too wide occupies the slot beside it as well, and the quotation reflects that. This is usually the first surprise in a project cargo exercise.',
      },
      {
        heading: 'Securing is part of the shipment',
        body: 'Cargo on a flat rack is exposed to the weather and to the movement of the vessel. Lashing, chocking and, where relevant, a lashing certificate are part of what has to be arranged, not an afterthought at the terminal gate.',
      },
    ],
  },
  {
    slug: 'roll-trailers',
    title: 'Roll trailers',
    eyebrow: 'Equipment',
    intro:
      'Heavy duty platforms towed on and off the vessel by terminal tractors, used on the Ro-Ro services.',
    categories: ['roll-trailer'],
    guidance: [
      {
        heading: 'The trailer stays in the port',
        body: 'Unlike a container, a roll trailer is terminal equipment. Cargo is loaded onto it inside the port and taken off at the destination terminal, so the shipper never sees the unit. That changes who is responsible for securing the cargo and when.',
      },
      {
        heading: 'Rolling cargo loads faster than it lifts',
        body: 'A Ro-Ro call can be worked without cranes, which is why the Optimed and Westmed services use it for cargo that would otherwise sit waiting for a crane window. The trade-off is that deck space is measured in lane metres rather than slots.',
      },
    ],
  },
];
