import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { Input } from "./heroui";
import { FaQuestionCircle, FaSearch } from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";
import { Spinner } from "@heroui/react";

function ClickHandler({ onClick }: { onClick: (e: any) => void }) {
  useMapEvents({
    click: onClick,
  });
  return null;
}

interface MapProps {
  init?: [number, number];
  onAddressChange?: ({
    address,
    lat,
    lng,
  }: {
    address: string;
    lat: string;
    lng: string;
  }) => void;
}

const cleanAddressText = (text: string) => {
  // Remove non-Latin characters except common punctuation and spaces
  return text
    .replace(/[^\x00-\x7F.,\-\s]/g, "")
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();
};

const Map = ({ init, onAddressChange }: MapProps) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (value.length > 3) {
      handleSearch(value);
    }
  }, 500);
  const [address, setAddress] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setPosition(null); // Clear reverse geocode position
    setAddress(null); // Clear reverse geocode address
    try {
      const response = await fetch(`/api/tools/geocode/search?query=${query}`);
      const data = await response.json();
      const results = Array.isArray(data) ? data : [];
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const FitBoundsToMarkers = () => {
    const map = useMapEvents({});

    useEffect(() => {
      if (searchResults.length > 0) {
        const bounds = searchResults.reduce((acc, result) => {
          return acc.extend([result.lat, result.lon]);
        }, L.latLngBounds([]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [searchResults, map]);

    return null;
  };

  useEffect(() => {
    setMapReady(true);
    if (init) {
      setPosition(init);
    }
  }, []);

  const handleMapClick = async (e: any) => {
    const { lat, lng } = e.latlng;
    setPosition([lat, lng]);
    setSearchResults([]); // Clear search results
    setLoading(true);

    try {
      const locationiq = await fetch(
        `/api/tools/geocode/reverse?lat=${lat}&lon=${lng}`
      );
      const response = await locationiq.json();
      setAddress(response);
      if (onAddressChange && response?.display_name) {
        const cleanedAddress = cleanAddressText(response.display_name);
        console.log("Map click address:", cleanedAddress);
        onAddressChange({
          address: cleanedAddress,
          lat,
          lng,
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddress("Failed to get address");
    } finally {
      setLoading(false);
    }
  };

  if (!mapReady) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="flex flex-col">
      <Input
        isClearable
        type="text"
        placeholder="Search for a location"
        startContent={<FaSearch size={16} className="text-primary" />}
        onChange={(e) => {
          setSearch(e.target.value);
          debouncedSearch(e.target.value);
        }}
        onClear={() => {
          setSearch("");
          setSearchResults([]);
        }}
        classNames={{
          inputWrapper: "rounded-b-none",
        }}
      />
      <div className="relative h-[360px] overflow-hidden">
        {loading && (
          <div className="absolute z-10 top-0 left-0 flex items-center justify-center w-full h-full bg-default-900 bg-opacity-50">
            <Spinner />
          </div>
        )}
        <MapContainer
          center={
            init && init[0] === 0 && init[1] === 0
              ? [-7.343651253620061, 112.71162764095831]
              : init
          }
          zoom={14}
          style={{ height: "360px", zIndex: 0 }}
        >
          <ClickHandler onClick={handleMapClick} />
          <FitBoundsToMarkers />
          {/* <TileLayer
            url={`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.vector?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}`}
          /> */}
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {searchResults?.map((result, i) => (
            <Marker
              key={i}
              position={[result.lat, result.lon]}
              eventHandlers={{
                click: () => {
                  setPosition([result.lat, result.lon]);
                  setAddress(result);
                  if (onAddressChange && result?.display_name) {
                    const cleanedAddress = cleanAddressText(
                      result.display_name
                    );
                    console.log("Map search result address:", cleanedAddress);
                    onAddressChange({
                      address: cleanedAddress,
                      lat: result.lat,
                      lng: result.lon,
                    });
                  }
                },
              }}
            >
              <Popup>{result.display_name}</Popup>
            </Marker>
          ))}
          {position && (
            <Marker position={position}>
              <Popup>Selected Location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      <div className="flex flex-col gap-0.5 px-4 py-3 rounded-b-lg bg-default-200">
        <div className="flex items-center gap-2 text-xs">
          <FaQuestionCircle size={12} className="text-primary" />
          <p>
            {search ? "Click on the marker" : "Click on the map"} to select a
            location
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <FaCircleInfo size={12} className="text-primary" />
          <p>Sometime&apos;s the address is not accurate</p>
        </div>
      </div>
    </div>
  );
};

export default Map;
