import { useEffect, useState } from "react";
import { fetchEvents, createEvent } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EventCard from "./EventCard";
import { Filter, Plus, Calendar, MapPin, Users } from "lucide-react";

const EventsWindow = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"UPCOMING" | "PAST">("UPCOMING");
  const [role, setRole] = useState<"ORGANIZER" | "ATTENDEE" | undefined>(undefined);
  const [showCancelled, setShowCancelled] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createData, setCreateData] = useState({
    title: "",
    description: "",
    dateTime: "",
    location: ""
  });
  const [clearDataTimeout, setClearDataTimeout] = useState<NodeJS.Timeout | null>(null);

  // Custom handler to only allow opening, not closing via outside clicks
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setCreateModalOpen(true);
      // Clear any existing timeout when opening
      if (clearDataTimeout) {
        clearTimeout(clearDataTimeout);
        setClearDataTimeout(null);
      }
    } else {
      // Only close if it's the X button (not outside click)
      setCreateModalOpen(false);
      // Set timeout to clear data after 30 seconds
      const timeout = setTimeout(() => {
        setCreateData({ title: "", description: "", dateTime: "", location: "" });
        setClearDataTimeout(null);
      }, 30000); // 30 seconds
      setClearDataTimeout(timeout);
    }
  };

  // Clear timeout on component unmount
  useEffect(() => {
    return () => {
      if (clearDataTimeout) {
        clearTimeout(clearDataTimeout);
      }
    };
  }, [clearDataTimeout]);

  useEffect(() => {
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

  const handleCreateEvent = async () => {
    if (!createData.title.trim() || !createData.dateTime || !createData.location.trim()) {
      return;
    }

    setCreateLoading(true);
    try {
      await createEvent(createData);
      setCreateModalOpen(false);
      if (clearDataTimeout) {
        clearTimeout(clearDataTimeout);
        setClearDataTimeout(null);
      }
      setCreateData({ title: "", description: "", dateTime: "", location: "" });
      refreshEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  const isUpcomingEmpty = timeframe === "UPCOMING" && events.length === 0 && !loading && !error;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold md:text-2xl">Events</h1>
          <Dialog open={createModalOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-title">Title *</Label>
                  <Input
                    id="create-title"
                    placeholder="Enter event title"
                    value={createData.title}
                    onChange={(e) => setCreateData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-description">Description</Label>
                  <Textarea
                    id="create-description"
                    placeholder="Enter event description (optional)"
                    value={createData.description}
                    onChange={(e) => setCreateData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-datetime">Date & Time *</Label>
                  <Input
                    id="create-datetime"
                    type="datetime-local"
                    value={createData.dateTime}
                    onChange={(e) => setCreateData(prev => ({ ...prev, dateTime: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-location">Location *</Label>
                  <Input
                    id="create-location"
                    placeholder="Enter event location"
                    value={createData.location}
                    onChange={(e) => setCreateData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <Button onClick={handleCreateEvent} disabled={createLoading} className="mt-2">
                  {createLoading ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
        ) : isUpcomingEmpty ? (
          <div className="col-span-full text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No upcoming events</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any upcoming events. Create one to get started!
                </p>
              </div>
              <Dialog open={createModalOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full">
                    Create An Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="create-title">Title *</Label>
                      <Input
                        id="create-title"
                        placeholder="Enter event title"
                        value={createData.title}
                        onChange={(e) => setCreateData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="create-description">Description</Label>
                      <Textarea
                        id="create-description"
                        placeholder="Enter event description (optional)"
                        value={createData.description}
                        onChange={(e) => setCreateData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="create-datetime">Date & Time *</Label>
                      <Input
                        id="create-datetime"
                        type="datetime-local"
                        value={createData.dateTime}
                        onChange={(e) => setCreateData(prev => ({ ...prev, dateTime: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="create-location">Location *</Label>
                      <Input
                        id="create-location"
                        placeholder="Enter event location"
                        value={createData.location}
                        onChange={(e) => setCreateData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleCreateEvent} disabled={createLoading} className="mt-2">
                      {createLoading ? 'Creating...' : 'Create Event'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
