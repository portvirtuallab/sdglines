import { useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Interactive network map.
 *
 * Loaded only on /ports/map, and Leaflet itself is imported dynamically inside
 * the effect so that the mapping library and its CSS never appear in the bundle
 * of any other page. Map tiles are requested from OpenStreetMap the moment this
 * component mounts, which is why it lives on a page a visitor chooses to open
 * rather than on the home page.
 *
 * This map is an alternative view, never the only one. The page that hosts it
 * renders the same ports and rotations as a table, and every port has its own
 * page reachable from the directory.
 */

export interface MapPort {
  id: string;
  name: string;
  displayName: string;
  country: string;
  region: string;
  slug: string;
  coordinates: [number, number];
  serviceIds: string[];
}

export interface MapService {
  id: string;
  name: string;
  color: string;
  portIds: string[];
}

interface Props {
  ports: MapPort[];
  services: MapService[];
  /** Base path of the deployment, used to build port links. */
  base: string;
}

export default function NetworkMap({ ports, services, base }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  const portsById = useMemo(
    () => new Map(ports.map((port) => [port.id, port])),
    [ports],
  );

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | undefined;

    async function build(): Promise<void> {
      try {
        const L = await import('leaflet');
        if (cancelled || !containerRef.current) return;

        map = L.map(containerRef.current, {
          center: [36, 12],
          zoom: 4,
          scrollWheelZoom: false, // Scrolling the page should scroll the page.
          worldCopyJump: true,
        });
        mapRef.current = map;

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 12,
          minZoom: 2,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('failed');
      }
    }

    void build();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Redraw the routes and markers whenever the service filter changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;

    let cancelled = false;

    async function draw(): Promise<void> {
      const L = await import('leaflet');
      if (cancelled || !mapRef.current) return;

      // Remove everything except the tile layer.
      mapRef.current.eachLayer((layer) => {
        if ('getAttribution' in layer && typeof layer.getAttribution === 'function') return;
        mapRef.current?.removeLayer(layer);
      });

      const shown = activeService
        ? services.filter((service) => service.id === activeService)
        : services;

      for (const service of shown) {
        const points = service.portIds
          .map((id) => portsById.get(id))
          .filter((port): port is MapPort => Boolean(port))
          .map((port) => port.coordinates);

        if (points.length > 1) {
          L.polyline(points, {
            color: service.color,
            weight: 3,
            opacity: 0.85,
          })
            .bindTooltip(`${service.name} service`)
            .addTo(mapRef.current);
        }
      }

      const shownPortIds = new Set(shown.flatMap((service) => service.portIds));

      for (const port of ports) {
        if (!shownPortIds.has(port.id)) continue;

        const isHub = port.serviceIds.length > 1;
        L.circleMarker(port.coordinates, {
          radius: isHub ? 7 : 5,
          color: '#081831',
          weight: 2,
          fillColor: isHub ? '#C8102E' : '#0B5FA5',
          fillOpacity: 1,
        })
          .bindPopup(
            `<strong>${port.displayName}</strong><br>${port.country}<br>` +
              `<a href="${base}/ports/${port.slug}">Open port page</a>`,
          )
          .addTo(mapRef.current);
      }
    }

    void draw();

    return () => {
      cancelled = true;
    };
  }, [activeService, status, ports, services, portsById, base]);

  return (
    <div>
      {/* Service filter. Works as a set of toggle buttons rather than a legend,
          so it is operable from the keyboard. */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveService(null)}
          aria-pressed={activeService === null}
          className={`tap-target inline-flex items-center rounded-lg border px-4 text-sm font-medium transition-colors duration-150 ${
            activeService === null
              ? 'border-navy-900 bg-navy-900 text-white'
              : 'border-navy-200 bg-white text-navy-800 hover:bg-navy-50'
          }`}
        >
          All services
        </button>

        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() => setActiveService(service.id)}
            aria-pressed={activeService === service.id}
            className={`tap-target inline-flex items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors duration-150 ${
              activeService === service.id
                ? 'border-navy-900 bg-navy-900 text-white'
                : 'border-navy-200 bg-white text-navy-800 hover:bg-navy-50'
            }`}
          >
            <span
              className="h-1.5 w-6 rounded-full"
              style={{ backgroundColor: service.color }}
              aria-hidden="true"
            />
            {service.name}
          </button>
        ))}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {activeService
          ? `Map showing the ${services.find((s) => s.id === activeService)?.name} service only.`
          : 'Map showing all services.'}
      </p>

      <div className="relative mt-4 overflow-hidden rounded-2xl border border-navy-200">
        {status === 'loading' && (
          <div className="flex h-[28rem] items-center justify-center bg-navy-50">
            <p className="text-sm text-navy-600">Loading the map&hellip;</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex h-[28rem] items-center justify-center bg-navy-50 px-6">
            <div className="max-w-md text-center">
              <p className="font-display text-lg font-semibold text-navy-900">
                The map could not be loaded
              </p>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">
                This can happen when the network blocks the map tile service. Every port and
                rotation on the map is also listed as text on this page and in the port directory.
              </p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className={status === 'ready' ? 'h-[28rem] w-full lg:h-[34rem]' : 'hidden'}
          // The map is decorative relative to the table below it: everything it
          // shows is available there, in a form that works with a keyboard.
          role="presentation"
        />
      </div>
    </div>
  );
}
