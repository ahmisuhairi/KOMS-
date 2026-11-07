import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useKoms } from '../context/KomsContext';
import {
  DUN_BY_PAR,
  ALL_CLASS_TYPES,
  PIN_COLORS,
  coordsForClass
} from '../utils/komsConstants';
import { ClassRecord } from '../types/koms';

export const PetaGISModule: React.FC = () => {
  const { classes, setSelectedClass } = useKoms();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [parlimenFilter, setParlimenFilter] = useState('');
  const [dunFilter, setDunFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const dunList = useMemo(() => {
    if (parlimenFilter && DUN_BY_PAR[parlimenFilter]) {
      return DUN_BY_PAR[parlimenFilter];
    }
    return Object.values(DUN_BY_PAR).flat();
  }, [parlimenFilter]);

  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      if (parlimenFilter && c['Kod Parlimen'] !== parlimenFilter) return false;
      if (dunFilter && !c['Kod DUN']?.startsWith(dunFilter)) return false;
      if (typeFilter) {
        const ct = c.ClassTypeID || '';
        if (ct.toLowerCase() !== typeFilter.toLowerCase()) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!c.ClassName?.toLowerCase().includes(q) && !c.Address?.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [classes, parlimenFilter, dunFilter, typeFilter, searchQuery]);

  // SVG Pin Generator
  const createPinIcon = (color: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path fill="${color}" stroke="#FFFFFF" stroke-width="1.8" d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z"/>
      <circle cx="14" cy="14" r="5" fill="#FFFFFF"/>
    </svg>`;
    return L.icon({
      iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
      iconSize: [28, 40],
      iconAnchor: [14, 40],
      popupAnchor: [0, -36]
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [6.444, 100.198],
        zoom: 11,
        zoomControl: true,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const bounds: L.LatLngTuple[] = [];

    const byDun: Record<string, number> = {};

    filteredClasses.forEach((c, idx) => {
      let [lat, lng] = coordsForClass(c);

      // Jitter overlapping pins in same DUN
      const dun = c['Kod DUN'] || 'x';
      byDun[dun] = (byDun[dun] || 0) + 1;
      const angle = (idx * 2.399) % (Math.PI * 2);
      const radius = 0.0035 + (idx % 6) * 0.0012;
      lat += Math.cos(angle) * radius;
      lng += Math.sin(angle) * radius;

      bounds.push([lat, lng]);

      const pinColor = PIN_COLORS[c.ClassTypeID] || '#C5A059';
      const icon = createPinIcon(pinColor);

      const marker = L.marker([lat, lng], { icon });

      // Custom HTML popup with direct open action
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-slate-900';
      popupContent.innerHTML = `
        <div style="min-width: 210px; font-family: system-ui, sans-serif; padding: 2px;">
          <span style="font-size: 9.5px; font-weight: 800; color: #2563EB; text-transform: uppercase;">${c.DivisionID} • ${c.ClassTypeID}</span>
          <h4 style="font-size: 13px; font-weight: 800; color: #0F172A; margin: 3px 0 4px; line-height: 1.25;">${c.ClassName}</h4>
          <p style="font-size: 10.5px; color: #64748B; margin-bottom: 6px;">${c['Kod Parlimen'] || ''} • ${c['Kod DUN'] || ''}</p>
          <button id="btn-popup-${c.ClassID.replace(/[^\w]/g, '_')}" style="width: 100%; background: #C5A059; color: #0A192F; font-size: 11px; font-weight: 800; padding: 6px 10px; border: none; border-radius: 8px; cursor: pointer; margin-bottom: 6px;">
            Buka Dossier Premis
          </button>
          <div style="border-top: 1px solid #CBD5E1; padding-top: 5px; margin-top: 2px;">
            <span style="font-size: 9px; font-weight: 700; color: #64748B; display: block; margin-bottom: 4px; text-transform: uppercase;">Buka di App Luar:</span>
            <div style="display: flex; gap: 4px;">
              <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #2563EB; color: #fff; font-size: 9.5px; font-weight: 700; padding: 4px 4px; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 3px;">
                <i class="fa-brands fa-google"></i> Maps
              </a>
              <a href="https://maps.apple.com/?q=${encodeURIComponent(c.ClassName)}&ll=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #0F172A; color: #fff; font-size: 9.5px; font-weight: 700; padding: 4px 4px; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 3px;">
                <i class="fa-brands fa-apple"></i> Apple
              </a>
              <a href="https://earth.google.com/web/search/${lat},${lng}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #059669; color: #fff; font-size: 9.5px; font-weight: 700; padding: 4px 4px; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 3px;">
                <i class="fa-solid fa-earth-asia"></i> Earth
              </a>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-${c.ClassID.replace(/[^\w]/g, '_')}`);
        if (btn) {
          btn.onclick = () => setSelectedClass(c);
        }
      });

      marker.addTo(layer);
    });

    if (bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch (e) {}
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [filteredClasses, setSelectedClass]);

  const resetFilters = () => {
    setParlimenFilter('');
    setDunFilter('');
    setTypeFilter('');
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filter Toolbar */}
      <div className="appos-card p-4 rounded-2xl flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
              <i className="fa-solid fa-map-location-dot"></i> Pemetaan Spatial GIS Premis KEMAS Perlis
            </h3>
            <p className="appos-text-muted text-xs mt-0.5">
              <span className="font-mono font-bold text-white">{filteredClasses.length} premis dipetakan</span>
              {' '}• Klik mana-mana pin untuk maklumat ringkas atau membuka dossier
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="btn-action text-xs py-1.5 px-3 rounded-lg"
          >
            <i className="fa-solid fa-rotate-left"></i> Set Semula Penapis
          </button>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Cari lokasi / premis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full filter-select py-2 px-3 rounded-xl text-xs"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            />
          </div>

          {/* Parlimen */}
          <div>
            <select
              value={parlimenFilter}
              onChange={(e) => {
                setParlimenFilter(e.target.value);
                setDunFilter('');
              }}
              className="w-full filter-select py-2 px-3 rounded-xl text-xs cursor-pointer"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="">Semua Parlimen</option>
              <option value="P.001">P.001 Padang Besar</option>
              <option value="P.002">P.002 Kangar</option>
              <option value="P.003">P.003 Arau</option>
            </select>
          </div>

          {/* DUN */}
          <div>
            <select
              value={dunFilter}
              onChange={(e) => setDunFilter(e.target.value)}
              className="w-full filter-select py-2 px-3 rounded-xl text-xs cursor-pointer"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="">Semua DUN</option>
              {dunList.map(d => (
                <option key={d.kod} value={d.kod}>{d.kod} {d.nama}</option>
              ))}
            </select>
          </div>

          {/* Jenis Kelas */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full filter-select py-2 px-3 rounded-xl text-xs cursor-pointer"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="">Semua Jenis Kelas</option>
              {ALL_CLASS_TYPES.map(t => (
                <option key={t} value={t}>{t === 'Dandanan DIri' ? 'Dandanan Diri' : t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Chips Filter for Class Types */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => setTypeFilter('')}
            className={`btn-action text-[11px] py-1 px-2.5 rounded-full ${
              typeFilter === '' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold' : ''
            }`}
          >
            Semua Jenis
          </button>
          {ALL_CLASS_TYPES.map(t => {
            const color = PIN_COLORS[t] || '#C5A059';
            const isActive = typeFilter.toLowerCase() === t.toLowerCase();
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(isActive ? '' : t)}
                className={`btn-action text-[11px] py-1 px-2.5 rounded-full flex items-center gap-1.5 ${
                  isActive ? 'ring-2 ring-[var(--accent-color)] font-extrabold text-white' : ''
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                <span>{t === 'Dandanan DIri' ? 'Dandanan Diri' : t}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="appos-card p-3 rounded-2xl overflow-hidden shadow-xl">
        <div
          ref={mapContainerRef}
          className="w-full h-[450px] sm:h-[520px] rounded-xl border border-[var(--border-color)] bg-slate-950 z-0"
        />
      </div>

      {/* Matching Premises List Below Map */}
      <div className="appos-card p-4 rounded-2xl flex flex-col gap-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--accent-color)]">
          Senarai Premis Terpilih ({filteredClasses.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredClasses.map((c, idx) => {
            const pinColor = PIN_COLORS[c.ClassTypeID] || '#C5A059';
            return (
              <div
                key={`peta-${c.ClassID}-${c.ClassName}-${idx}`}
                onClick={() => setSelectedClass(c)}
                className="appos-card-subtle p-3 rounded-xl cursor-pointer hover:border-[var(--accent-color)] transition-all flex flex-col justify-between"
                style={{ borderLeft: `4px solid ${pinColor}` }}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                      {c.ClassID}
                    </span>
                    <span className="text-slate-300 font-bold">{c.ClassTypeID}</span>
                  </div>
                  <h5 className="text-xs font-bold text-white line-clamp-1">{c.ClassName}</h5>
                  <p className="appos-text-muted text-[10.5px] line-clamp-1 mt-0.5">{c.Address || '—'}</p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[var(--border-color)] text-[10px] text-slate-400">
                  <span>{c['Kod DUN'] || ''}</span>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[9px] text-slate-500 font-mono hidden sm:inline">
                      {coordsForClass(c).map(n => n.toFixed(3)).join(', ')}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${coordsForClass(c)[0]},${coordsForClass(c)[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Buka dalam Google Maps"
                    >
                      <i className="fa-brands fa-google text-xs"></i>
                    </a>
                    <a
                      href={`https://maps.apple.com/?q=${encodeURIComponent(c.ClassName)}&ll=${coordsForClass(c)[0]},${coordsForClass(c)[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-white transition-colors"
                      title="Buka dalam Apple Maps"
                    >
                      <i className="fa-brands fa-apple text-xs"></i>
                    </a>
                    <a
                      href={`https://earth.google.com/web/search/${coordsForClass(c)[0]},${coordsForClass(c)[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      title="Buka dalam Google Earth"
                    >
                      <i className="fa-solid fa-earth-asia text-xs"></i>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
