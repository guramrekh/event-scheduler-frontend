import { useEffect, useState } from "react";
import { fetchEvents } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import EventCard from "./EventCard";
import { Filter } from "lucide-react";

const EventsWindow = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"UPCOMING" | "PAST">("UPCOMING");
  const [role, setRole] = useState<"ORGANIZER" | "ATTENDEE" | undefined>(undefined);
  const [showCancelled, setShowCancelled] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    console.log("Fetching events with params:", { timeframe, role, showCancelled });
    
    fetchEvents({
      timeframe,
      role,
      showCancelled,
    })
      .then(res => {
        console.log("Events response:", res.data);
        setEvents(res.data);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setError(err.response?.data?.message || "Failed to load events");
      })
      .finally(() => setLoading(false));
  }, [timeframe, role, showCancelled]);

  // Function to refresh events
  const refreshEvents = () => {
    setLoading(true);
    setError(null);
    
    fetchEvents({
      timeframe,
      role,
      showCancelled,
    })
      .then(res => {
        setEvents(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load events");
      })
      .finally(() => setLoading(false));
  };

  // ToggleGroup for role: allow unselecting
  const handleRoleChange = (val: string | undefined) => {
    setRole(val === "organizer" ? "ORGANIZER" : val === "attendee" ? "ATTENDEE" : undefined);
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Events</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Timeframe</Label>
                <ToggleGroup
                  type="single"
                  value={timeframe.toLowerCase()}
                  onValueChange={val => setTimeframe(val === "past" ? "PAST" : "UPCOMING")}
                  variant="outline"
                >
                  <ToggleGroupItem value="upcoming" className="w-full">Upcoming</ToggleGroupItem>
                  <ToggleGroupItem value="past" className="w-full">Past</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <ToggleGroup
                  type="single"
                  value={role ? role.toLowerCase() : undefined}
                  onValueChange={handleRoleChange}
                  variant="outline"
                >
                  <ToggleGroupItem value="organizer" className="w-full">Organizer</ToggleGroupItem>
                  <ToggleGroupItem value="attendee" className="w-full">Attendee</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="show-cancelled" checked={showCancelled} onCheckedChange={val => setShowCancelled(!!val)} />
                <Label htmlFor="show-cancelled">Show Cancelled Events</Label>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        { error ? (
          <div className="col-span-full text-center py-8">
            <div className="text-red-500 mb-2">Error: {error}</div>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">No events found.</div>
        ) : (
          events.map(eventWithRole => (
            <EventCard key={eventWithRole.event.id} eventWithRole={eventWithRole} onEventUpdate={refreshEvents} />
          ))
        )}
      </div>
    </div>
  );
};

export default EventsWindow;
