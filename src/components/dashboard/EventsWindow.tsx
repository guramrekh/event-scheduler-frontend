
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import EventCard from "./EventCard";

const mockEvents = [
  { id: 1, name: "Project Kick-off", description: "Initial meeting for the new project.", location: "Online", dateTime: "2025-07-01T10:00:00", organizers: ["Alice"], attendees: 12, isOrganizer: true, status: "upcoming" },
  { id: 2, name: "Design Sprint", description: "Week-long design sprint.", location: "Office 301", dateTime: "2025-07-05T09:00:00", organizers: ["Bob"], attendees: 8, isOrganizer: false, status: "upcoming" },
  { id: 3, name: "Quarterly Review", description: "Review of Q2 performance.", location: "Conference Hall", dateTime: "2025-06-10T14:00:00", organizers: ["Charlie"], attendees: 25, isOrganizer: false, status: "occurred" },
  { id: 4, name: "Team Lunch", description: "Cancelled due to weather.", location: "The Grand Cafe", dateTime: "2025-06-14T12:30:00", organizers: ["Alice"], attendees: 10, isOrganizer: true, status: "cancelled" },
];

const EventsWindow = () => {
  return (
    <div className="grid gap-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Events</h1>
      </div>
      <div className="border shadow-sm rounded-lg p-4 grid gap-4">
        <h2 className="font-semibold">Filters</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Date Range</Label>
            <Slider defaultValue={[25]} max={100} step={1} className="my-4"/>
          </div>
          <div className="flex flex-col gap-4">
            <ToggleGroup type="single" defaultValue="upcoming" variant="outline">
              <ToggleGroupItem value="upcoming">Upcoming</ToggleGroupItem>
              <ToggleGroupItem value="occurred">Occurred</ToggleGroupItem>
            </ToggleGroup>
            <div className="flex items-center space-x-2">
              <Checkbox id="show-cancelled" />
              <Label htmlFor="show-cancelled">Show Cancelled Events</Label>
            </div>
            <ToggleGroup type="single" variant="outline">
              <ToggleGroupItem value="my-events">My Events</ToggleGroupItem>
              <ToggleGroupItem value="attended-events">Attended Events</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockEvents.map(event => <EventCard key={event.id} event={event} />)}
      </div>
    </div>
  )
}

export default EventsWindow;
