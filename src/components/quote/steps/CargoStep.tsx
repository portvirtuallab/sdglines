/**
 * Step 2: what is being shipped.
 *
 * The unit types offered come from the tariff, not from a list written here, so
 * a unit nobody can price cannot be chosen. The facts shown about a chosen unit
 * are only the ones the workbook states: internal dimensions and door openings
 * are not in the operational data, so they are absent rather than estimated.
 */

import { Field, RadioGroup, controlClass } from '../fields';
import { MAX_UNITS, type QuoteDraft } from '../model';
import { equipment as allEquipment, getEquipment } from '@/lib/quote/network';
import { number } from '../format';
import type { EquipmentFamily } from '@/types/quote';
import type { StepProps } from './types';

const FAMILY_LABELS: Record<EquipmentFamily, string> = {
  container: 'Container',
  reefer: 'Reefer (temperature controlled)',
  'flat-rack': 'Flat rack',
  'roll-trailer': 'Roll trailer',
  'semi-trailer': 'Semi-trailer',
  vehicles: 'Vehicles',
  project: 'Project cargo',
};

/** The nine IMO classes, which are a published fact rather than a local choice. */
const IMO_CLASSES = [
  '1 - Explosives',
  '2 - Gases',
  '3 - Flammable liquids',
  '4 - Flammable solids',
  '5 - Oxidising substances and organic peroxides',
  '6 - Toxic and infectious substances',
  '7 - Radioactive material',
  '8 - Corrosive substances',
  '9 - Miscellaneous dangerous substances and articles',
];

export function CargoStep({
  draft,
  set,
  errorFor,
  families,
  unitTypes,
}: StepProps & { families: EquipmentFamily[]; unitTypes: typeof allEquipment }) {
  return (
    <>
      <RadioGroup
        name="dangerousGoods"
        legend="Does the shipment contain dangerous goods?"
        hint="Declaring dangerous goods adds the IMO surcharge and asks for the details a real booking would need."
        value={draft.dangerousGoods}
        onChange={(value) => set('dangerousGoods', value as QuoteDraft['dangerousGoods'])}
        error={errorFor('dangerousGoods')}
        options={[
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Yes' },
        ]}
      />

      {draft.dangerousGoods === 'yes' && (
        <div className="rounded-xl border border-navy-200 bg-navy-50/50 p-5">
          <p className="text-sm text-navy-700">
            SDG Lines is a simulation and accepts no cargo of any kind. These fields exist so that
            the exercise covers the details a dangerous goods booking actually requires.
          </p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <Field id="unNumber" label="UN number" required error={errorFor('unNumber')}>
              {(props) => (
                <input
                  {...props}
                  className={`${controlClass} font-mono`}
                  inputMode="numeric"
                  placeholder="1203"
                  value={draft.unNumber}
                  onChange={(event) => set('unNumber', event.target.value)}
                />
              )}
            </Field>
            <Field id="imoClass" label="IMO class" required error={errorFor('imoClass')}>
              {(props) => (
                <select
                  {...props}
                  className={controlClass}
                  value={draft.imoClass}
                  onChange={(event) => set('imoClass', event.target.value)}
                >
                  <option value="">Choose a class</option>
                  {IMO_CLASSES.map((imoClass) => (
                    <option key={imoClass} value={imoClass}>
                      {imoClass}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <div className="sm:col-span-2">
              <Field
                id="properShippingName"
                label="Proper shipping name"
                required
                error={errorFor('properShippingName')}
              >
                {(props) => (
                  <input
                    {...props}
                    className={controlClass}
                    placeholder="Petrol"
                    value={draft.properShippingName}
                    onChange={(event) => set('properShippingName', event.target.value)}
                  />
                )}
              </Field>
            </div>
            <Field id="packingGroup" label="Packing group" error={errorFor('packingGroup')}>
              {(props) => (
                <select
                  {...props}
                  className={controlClass}
                  value={draft.packingGroup}
                  onChange={(event) => set('packingGroup', event.target.value)}
                >
                  <option value="">Not applicable</option>
                  <option value="I">I - high danger</option>
                  <option value="II">II - medium danger</option>
                  <option value="III">III - low danger</option>
                </select>
              )}
            </Field>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="equipmentFamily"
          label="Type of service"
          required
          hint="Only the services the operational data covers are offered."
          error={errorFor('equipmentFamily')}
        >
          {(props) => (
            <select
              {...props}
              className={controlClass}
              value={draft.equipmentFamily}
              onChange={(event) => {
                set('equipmentFamily', event.target.value);
                set('equipmentId', '');
              }}
            >
              <option value="">Choose a service</option>
              {families.map((family) => (
                <option key={family} value={family}>
                  {FAMILY_LABELS[family]}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          id="equipmentId"
          label="Unit type"
          required
          hint={draft.equipmentFamily ? undefined : 'Choose a type of service first.'}
          error={errorFor('equipmentId')}
        >
          {(props) => (
            <select
              {...props}
              className={controlClass}
              disabled={!draft.equipmentFamily}
              value={draft.equipmentId}
              onChange={(event) => set('equipmentId', event.target.value)}
            >
              <option value="">
                {draft.equipmentFamily ? 'Choose a unit type' : 'Choose a service first'}
              </option>
              {unitTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      {draft.equipmentId && <EquipmentDetails id={Number(draft.equipmentId)} />}

      <Field
        id="quantity"
        label="Number of units"
        required
        hint={`Between 1 and ${MAX_UNITS}. Every unit is priced, so this moves the quotation.`}
        error={errorFor('quantity')}
      >
        {(props) => (
          <input
            {...props}
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_UNITS}
            step={1}
            className={`${controlClass} sm:max-w-[10rem]`}
            value={draft.quantity}
            onChange={(event) => set('quantity', event.target.value)}
          />
        )}
      </Field>
    </>
  );
}

/** What the workbook states about the chosen unit, and nothing more. */
function EquipmentDetails({ id }: { id: number }) {
  const item = getEquipment(id);
  if (!item) return null;

  const facts: Array<[string, string]> = [];
  if (item.maxPayloadKg != null) {
    facts.push(['Maximum payload', `${number.format(item.maxPayloadKg)} kg`]);
  }
  facts.push(['Linear metres', `${item.linearMetres.toFixed(3)} m`]);
  facts.push(['Freight factor', `${item.freightFactor.toFixed(2)} of the 40-foot reference rate`]);
  if (item.emissionsTonnesPerTeu != null) {
    facts.push(['Emissions factor', `${item.emissionsTonnesPerTeu} t CO2e per TEU`]);
  }
  if (item.requiresPlug) facts.push(['Power', 'Needs a reefer plug']);

  return (
    <dl className="grid gap-x-8 gap-y-3 rounded-xl border border-navy-200 bg-white p-5 sm:grid-cols-2">
      {facts.map(([term, value]) => (
        <div key={term} className="flex justify-between gap-4 text-sm">
          <dt className="text-navy-600">{term}</dt>
          <dd className="font-mono text-navy-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
