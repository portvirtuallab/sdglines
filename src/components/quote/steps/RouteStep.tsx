/**
 * Step 1: where the shipment goes.
 *
 * The destination list is built by the routing engine from the chosen origin,
 * so a pair the network cannot serve is never offered. That is the whole point
 * of driving the form from the operational data rather than from a static list.
 */

import { useMemo } from 'react';
import { Field, controlClass } from '../fields';
import { JourneyPanel } from './JourneyPanel';
import { quotablePorts } from '@/lib/quote/network';
import type { Journey } from '@/lib/quote/routing';
import type { Port } from '@/types/quote';
import type { StepProps } from './types';

/** Group ports by region, so a select of 36 is readable. */
function byRegion(ports: Port[]): Array<[string, Port[]]> {
  const groups = new Map<string, Port[]>();
  for (const port of ports) {
    if (!groups.has(port.region)) groups.set(port.region, []);
    groups.get(port.region)!.push(port);
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function PortOptions({ groups }: { groups: Array<[string, Port[]]> }) {
  return (
    <>
      {groups.map(([region, ports]) => (
        <optgroup key={region} label={region}>
          {ports.map((port) => (
            <option key={port.id} value={port.id}>
              {port.displayName} ({port.locode ?? port.country})
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}

export function RouteStep({
  draft,
  set,
  errorFor,
  destinations,
  preview,
}: StepProps & { destinations: Port[]; preview: Journey | null }) {
  const origins = useMemo(() => byRegion(quotablePorts), []);
  const reachable = useMemo(() => byRegion(destinations), [destinations]);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="originPortId"
          label="Port of origin"
          required
          hint="Type to jump to a port. Grouped by region."
          error={errorFor('originPortId')}
        >
          {(props) => (
            <select
              {...props}
              className={controlClass}
              value={draft.originPortId}
              onChange={(event) => {
                set('originPortId', event.target.value);
                set('destinationPortId', '');
              }}
            >
              <option value="">Choose a port</option>
              <PortOptions groups={origins} />
            </select>
          )}
        </Field>

        <Field
          id="destinationPortId"
          label="Port of destination"
          required
          hint={
            draft.originPortId
              ? 'Only the ports SDG Lines can reach from your origin are listed.'
              : 'Choose the port of origin first.'
          }
          error={errorFor('destinationPortId')}
        >
          {(props) => (
            <select
              {...props}
              className={controlClass}
              disabled={!draft.originPortId}
              value={draft.destinationPortId}
              onChange={(event) => set('destinationPortId', event.target.value)}
            >
              <option value="">
                {draft.originPortId ? 'Choose a port' : 'Choose an origin first'}
              </option>
              <PortOptions groups={reachable} />
            </select>
          )}
        </Field>
      </div>

      <Field
        id="desiredDeparture"
        label="Desired departure date"
        required
        hint="The date you would like to sail. SDG Lines publishes no sailing schedule, so this is a request, not a confirmed sailing."
        error={errorFor('desiredDeparture')}
      >
        {(props) => (
          <input
            {...props}
            type="date"
            className={`${controlClass} sm:max-w-xs`}
            value={draft.desiredDeparture}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => set('desiredDeparture', event.target.value)}
          />
        )}
      </Field>

      {preview && <JourneyPanel journey={preview} />}
    </>
  );
}
