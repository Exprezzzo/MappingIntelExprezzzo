// ZoneManager UI component (React + Tailwind + Firebase + Google Maps)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { Loader } from '@googlemaps/js-api-loader';

interface Zone {
  id: string;
  name: string;
  displayName: string;
  type: 'district' | 'venue-cluster';
  status: 'sandbox' | 'hidden' | 'live';
  polygon: { type: 'Polygon'; coordinates: number[][] };
  cityId: string;
  vendorCount: number;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface City {
  id: string;
  name: string;
  country: string;
  center: { lat: number; lng: number };
  defaultZoom: number;
  status: 'sandbox' | 'live';
}

const ZoneManager: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const currentPolygonRef = useRef<google.maps.Polygon | null>(null);

  const [zones, setZones] = useState<Zone[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newZoneData, setNewZoneData] = useState({
    name: '',
    displayName: '',
    type: 'district' as const,
    tags: [] as string[],
  });
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: 'weekly',
        libraries: ['drawing', 'geometry'],
      });

      const google = await loader.load();

      if (mapRef.current && !googleMapRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 36.1699, lng: -115.1398 },
          zoom: 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: false,
          polygonOptions: {
            fillColor: '#3B82F6',
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: '#2563EB',
            editable: true,
            draggable: true,
          },
        });

        drawingManager.setMap(map);
        googleMapRef.current = map;
        drawingManagerRef.current = drawingManager;
        setMapLoaded(true);

        google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
          currentPolygonRef.current = polygon;
          setIsDrawing(false);
          setShowZoneForm(true);
          drawingManager.setDrawingMode(null);
        });
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      const citiesSnapshot = await getDocs(collection(db, 'cities'));
      const citiesData = citiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as City));
      setCities(citiesData);
      if (citiesData.length > 0 && !selectedCity) {
        setSelectedCity(citiesData[0].id);
      }
    };

    loadCities();
  }, []);

  useEffect(() => {
    if (!selectedCity) return;

    const unsubscribe = onSnapshot(collection(db, `cities/${selectedCity}/zones`), (snapshot) => {
      const zonesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Zone));
      setZones(zonesData);
      renderZonesOnMap(zonesData);
    });

    return () => unsubscribe();
  }, [selectedCity]);

  useEffect(() => {
    if (selectedCity && googleMapRef.current) {
      const city = cities.find(c => c.id === selectedCity);
      if (city) {
        googleMapRef.current.setCenter(city.center);
        googleMapRef.current.setZoom(city.defaultZoom);
      }
    }
  }, [selectedCity, cities]);

  const renderZonesOnMap = (zonesToRender: Zone[]) => {
    if (!googleMapRef.current) return;

    zonesToRender.forEach(zone => {
      const paths = zone.polygon.coordinates[0].map(coord => ({ lat: coord[1], lng: coord[0] }));
      const polygon = new google.maps.Polygon({
        paths,
        fillColor: zone.status === 'live' ? '#10B981' : '#F59E0B',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: zone.status === 'live' ? '#059669' : '#D97706',
      });
      polygon.setMap(googleMapRef.current);
    });
  };

  const startDrawing = () => {
    if (drawingManagerRef.current) {
      setIsDrawing(true);
      drawingManagerRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
  };

  const cancelDrawing = () => {
    if (currentPolygonRef.current) {
      currentPolygonRef.current.setMap(null);
      currentPolygonRef.current = null;
    }
    setIsDrawing(false);
    setShowZoneForm(false);
    setNewZoneData({ name: '', displayName: '', type: 'district', tags: [] });
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null);
    }
  };

  const saveZone = async () => {
    if (!currentPolygonRef.current || !selectedCity) return;

    setIsSaving(true);
    try {
      const path = currentPolygonRef.current.getPath();
      const coordinates = path.getArray().map(latLng => [latLng.lng(), latLng.lat()]);
      coordinates.push(coordinates[0]);

      const vendorsSnapshot = await getDocs(query(collection(db, 'vendors'), where('zoneIds', 'array-contains', newZoneData.name)));

      const zone: Omit<Zone, 'id'> = {
        name: newZoneData.name,
        displayName: newZoneData.displayName,
        type: newZoneData.type,
        status: 'sandbox',
        polygon: { type: 'Polygon', coordinates: [coordinates] },
        cityId: selectedCity,
        vendorCount: vendorsSnapshot.size,
        tags: newZoneData.tags,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(db, `cities/${selectedCity}/zones`, newZoneData.name), zone);

      await setDoc(doc(collection(db, 'adminActions')), {
        type: 'zone_created',
        zoneId: newZoneData.name,
        cityId: selectedCity,
        timestamp: Timestamp.now(),
        metadata: { displayName: newZoneData.displayName },
      });

      cancelDrawing();
    } catch (error) {
      console.error('Error saving zone:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleZoneStatus = async (zoneId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'live' ? 'sandbox' : 'live';

    await setDoc(doc(db, `cities/${selectedCity}/zones`, zoneId), {
      status: newStatus,
      updatedAt: Timestamp.now()
    }, { merge: true });

    await setDoc(doc(collection(db, 'adminActions')), {
      type: 'zone_status_changed',
      zoneId,
      cityId: selectedCity,
      timestamp: Timestamp.now(),
      metadata: { from: currentStatus, to: newStatus },
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-900">Zone Manager</h1>
          <div className="mt-3 flex items-center gap-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}, {city.country}</option>
              ))}
            </select>
            <button
              onClick={startDrawing}
              disabled={!selectedCity || isDrawing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:bg-gray-300"
            >Draw Zone</button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <div ref={mapRef} className="h-full w-full" />

        <div className="absolute left-4 top-4 bg-white rounded-lg shadow-lg p-4 max-w-xs max-h-96 overflow-y-auto">
          <h3 className="font-medium text-gray-900 mb-3">Active Zones</h3>
          {zones.length === 0 ? (
            <p className="text-sm text-gray-500">No zones created yet</p>
          ) : (
            <div className="space-y-2">
              {zones.map(zone => (
                <div key={zone.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{zone.displayName}</p>
                      <p className="text-xs text-gray-500">{zone.vendorCount} vendors</p>
                    </div>
                    <button
                      onClick={() => toggleZoneStatus(zone.id, zone.status)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        zone.status === 'live' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >{zone.status}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isDrawing && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm">Click on the map to draw zone boundaries</p>
          </div>
        )}
      </div>

      {showZoneForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">New Zone Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone ID (lowercase, no spaces)</label>
                <input
                  type="text"
                  value={newZoneData.name}
                  onChange={(e) => setNewZoneData({ ...newZoneData, name: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="downtown-vegas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={newZoneData.displayName}
                  onChange={(e) => setNewZoneData({ ...newZoneData, displayName: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Downtown Vegas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone Type</label>
                <select
                  value={newZoneData.type}
                  onChange={(e) => setNewZoneData({ ...newZoneData, type: e.target.value as 'district' | 'venue-cluster' })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="district">District</option>
                  <option value="venue-cluster">Venue Cluster</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  onChange={(e) => setNewZoneData({ ...newZoneData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="nightlife, entertainment"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={saveZone}
                disabled={!newZoneData.name || !newZoneData.displayName || isSaving}
                className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 font-medium disabled:bg-gray-300"
              >{isSaving ? 'Saving...' : 'Save Zone'}</button>
              <button
                onClick={cancelDrawing}
                className="flex-1 bg-gray-200 text-gray-800 rounded-lg px-4 py-2 font-medium"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneManager;
