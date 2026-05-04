import { useState, useEffect } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface City {
  name: string;
  timezone: string;
  country: string;
}

const ALL_CITIES: City[] = [
  { name: "New York", timezone: "America/New_York", country: "US" },
  { name: "Los Angeles", timezone: "America/Los_Angeles", country: "US" },
  { name: "Chicago", timezone: "America/Chicago", country: "US" },
  { name: "Denver", timezone: "America/Denver", country: "US" },
  { name: "Miami", timezone: "America/New_York", country: "US" },
  { name: "Honolulu", timezone: "Pacific/Honolulu", country: "US" },
  { name: "Anchorage", timezone: "America/Anchorage", country: "US" },
  { name: "Toronto", timezone: "America/Toronto", country: "CA" },
  { name: "Vancouver", timezone: "America/Vancouver", country: "CA" },
  { name: "Mexico City", timezone: "America/Mexico_City", country: "MX" },
  { name: "São Paulo", timezone: "America/Sao_Paulo", country: "BR" },
  { name: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", country: "AR" },
  { name: "London", timezone: "Europe/London", country: "GB" },
  { name: "Paris", timezone: "Europe/Paris", country: "FR" },
  { name: "Berlin", timezone: "Europe/Berlin", country: "DE" },
  { name: "Madrid", timezone: "Europe/Madrid", country: "ES" },
  { name: "Rome", timezone: "Europe/Rome", country: "IT" },
  { name: "Amsterdam", timezone: "Europe/Amsterdam", country: "NL" },
  { name: "Stockholm", timezone: "Europe/Stockholm", country: "SE" },
  { name: "Athens", timezone: "Europe/Athens", country: "GR" },
  { name: "Lisbon", timezone: "Europe/Lisbon", country: "PT" },
  { name: "Istanbul", timezone: "Europe/Istanbul", country: "TR" },
  { name: "Moscow", timezone: "Europe/Moscow", country: "RU" },
  { name: "Cairo", timezone: "Africa/Cairo", country: "EG" },
  { name: "Johannesburg", timezone: "Africa/Johannesburg", country: "ZA" },
  { name: "Lagos", timezone: "Africa/Lagos", country: "NG" },
  { name: "Nairobi", timezone: "Africa/Nairobi", country: "KE" },
  { name: "Dubai", timezone: "Asia/Dubai", country: "AE" },
  { name: "Riyadh", timezone: "Asia/Riyadh", country: "SA" },
  { name: "Tel Aviv", timezone: "Asia/Jerusalem", country: "IL" },
  { name: "Tehran", timezone: "Asia/Tehran", country: "IR" },
  { name: "Kabul", timezone: "Asia/Kabul", country: "AF" },
  { name: "Karachi", timezone: "Asia/Karachi", country: "PK" },
  { name: "Mumbai", timezone: "Asia/Kolkata", country: "IN" },
  { name: "Colombo", timezone: "Asia/Colombo", country: "LK" },
  { name: "Dhaka", timezone: "Asia/Dhaka", country: "BD" },
  { name: "Bangkok", timezone: "Asia/Bangkok", country: "TH" },
  { name: "Singapore", timezone: "Asia/Singapore", country: "SG" },
  { name: "Kuala Lumpur", timezone: "Asia/Kuala_Lumpur", country: "MY" },
  { name: "Jakarta", timezone: "Asia/Jakarta", country: "ID" },
  { name: "Manila", timezone: "Asia/Manila", country: "PH" },
  { name: "Hong Kong", timezone: "Asia/Hong_Kong", country: "HK" },
  { name: "Shanghai", timezone: "Asia/Shanghai", country: "CN" },
  { name: "Beijing", timezone: "Asia/Shanghai", country: "CN" },
  { name: "Taipei", timezone: "Asia/Taipei", country: "TW" },
  { name: "Seoul", timezone: "Asia/Seoul", country: "KR" },
  { name: "Tokyo", timezone: "Asia/Tokyo", country: "JP" },
  { name: "Sydney", timezone: "Australia/Sydney", country: "AU" },
  { name: "Melbourne", timezone: "Australia/Melbourne", country: "AU" },
  { name: "Auckland", timezone: "Pacific/Auckland", country: "NZ" },
];

const STORAGE_KEY = "snooze-grid-world-clocks";

function getLocalOffset(tz: string): string {
  const now = new Date();
  const local = now.getTime();
  const utcMs = local + now.getTimezoneOffset() * 60000;

  const tzFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const tzParts = tzFormatter.formatToParts(now);
  const tzH = Number(tzParts.find((p) => p.type === "hour")?.value ?? 0);
  const tzM = Number(tzParts.find((p) => p.type === "minute")?.value ?? 0);

  const localH = now.getHours();
  const localM = now.getMinutes();

  const diffMin = tzH * 60 + tzM - (localH * 60 + localM);

  if (Math.abs(diffMin) < 5) return "Same time";
  const sign = diffMin > 0 ? "+" : "−";
  const absDiff = Math.abs(diffMin);
  if (absDiff % 60 === 0) return `${sign}${absDiff / 60}h`;
  const h = Math.floor(absDiff / 60);
  const m = absDiff % 60;
  return h === 0 ? `${sign}${m}m` : `${sign}${h}h ${m}m`;
}

function CityTime({ city, onRemove }: { city: City; onRemove: () => void }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = new Intl.DateTimeFormat("en-US", {
    timeZone: city.timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  const dateStr = new Intl.DateTimeFormat("en-US", {
    timeZone: city.timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(now);

  const offset = getLocalOffset(city.timezone);

  const [timePart, period] = timeStr.split(" ");

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-mono-display text-3xl font-light text-foreground leading-none">
            {timePart}
          </span>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-medium text-foreground">{city.name}</span>
          <span className="text-xs text-muted-foreground">{dateStr}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          offset === "Same time"
            ? "bg-primary/20 text-primary"
            : "bg-secondary text-muted-foreground"
        }`}>
          {offset}
        </span>
        <button
          onClick={onRemove}
          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function WorldClock() {
  const [selectedCities, setSelectedCities] = useState<City[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCities));
  }, [selectedCities]);

  const addCity = (city: City) => {
    if (selectedCities.some((c) => c.name === city.name)) return;
    setSelectedCities((prev) => [...prev, city]);
    setShowAdd(false);
    setSearch("");
  };

  const removeCity = (name: string) => {
    setSelectedCities((prev) => prev.filter((c) => c.name !== name));
  };

  const filtered = search
    ? ALL_CITIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.country.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_CITIES;

  const available = filtered.filter(
    (c) => !selectedCities.some((s) => s.name === c.name)
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="px-4 pt-10 pb-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
            World Clock
          </h1>
          <button
            onClick={() => setShowAdd(true)}
            data-testid="world-clock-add"
            className="flex items-center gap-1.5 text-sm text-primary font-medium"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {selectedCities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/50 py-12 text-center mt-8">
            <span className="text-3xl mb-3 block">🌍</span>
            <p className="text-sm text-muted-foreground">No cities added yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Tap Add to track a city's time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedCities.map((city) => (
              <CityTime
                key={city.name}
                city={city}
                onRemove={() => removeCity(city.name)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-xs max-h-[80vh] flex flex-col" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-foreground">Add City</DialogTitle>
          </DialogHeader>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cities..."
              className="pl-9 bg-secondary border-border text-foreground"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 -mx-1">
            {available.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">No cities found</p>
            ) : (
              available.map((city) => (
                <button
                  key={city.name}
                  onClick={() => addCity(city)}
                  className="w-full flex items-center justify-between px-2 py-2.5 rounded hover:bg-secondary transition-colors text-left"
                >
                  <span className="text-sm font-medium text-foreground">{city.name}</span>
                  <span className="text-xs text-muted-foreground">{city.country}</span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
