/**
 * Lookups over the imported SDG Lines network.
 *
 * Everything the quotation tool, the route pages and the map need to resolve an
 * id goes through here, so that there is one place where a missing port or an
 * unknown service is handled the same way.
 */

import { ports, services, vessels } from '@/data/quote/network';
import { equipment } from '@/data/quote/equipment';
import { distancesNm } from '@/data/quote/distances';
import type { Equipment, Port, Service, Vessel } from '@/types/quote';

const portById = new Map(ports.map((port) => [port.id, port]));
const serviceById = new Map(services.map((service) => [service.id, service]));
const vesselById = new Map(vessels.map((vessel) => [vessel.id, vessel]));
const equipmentById = new Map(equipment.map((item) => [item.id, item]));

export { ports, services, vessels, equipment };

export const getPort = (id: string): Port | undefined => portById.get(id);
export const getService = (id: string): Service | undefined => serviceById.get(id);
export const getVessel = (id: string): Vessel | undefined => vesselById.get(id);
export const getEquipment = (id: number): Equipment | undefined => equipmentById.get(id);

/**
 * The direct sailing distance the price is based on.
 *
 * This is the workbook's own port-to-port matrix, not the distance the routed
 * voyage actually covers. The two differ, and the price uses this one - see
 * docs/quote/pricing-model.md.
 */
export function directDistanceNm(fromPortId: string, toPortId: string): number | null {
  return distancesNm[fromPortId]?.[toPortId] ?? distancesNm[toPortId]?.[fromPortId] ?? null;
}

/**
 * A port can be quoted only when the workbook gives it everything the price
 * needs: a class for the handling tariff and a base index for the freight.
 *
 * Palma currently fails this test. It is served by Gimnesias but has no entry in
 * the freight rate table, so the form offers it as a destination one can read
 * about and refuses to price it rather than inventing a rate.
 */
export function isQuotable(port: Port | undefined): port is Port {
  return Boolean(port && port.portClass && port.baseIndex != null);
}

/** Ports that can appear as an origin, in display order. */
export const quotablePorts = ports
  .filter(isQuotable)
  .sort((a, b) => a.displayName.localeCompare(b.displayName));

/** Every service that calls at a port. */
export function servicesCallingAt(portId: string): Service[] {
  return services.filter((service) =>
    service.legs.some((leg) => leg.fromPortId === portId || leg.toPortId === portId),
  );
}

/** The vessels assigned to a service, in the workbook's order. */
export function vesselsOnService(serviceId: string): Vessel[] {
  return vessels.filter((vessel) => vessel.serviceId === serviceId);
}
