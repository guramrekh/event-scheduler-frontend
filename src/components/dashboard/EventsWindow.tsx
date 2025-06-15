
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import EventCard from "./EventCard";
import { Filter } from "lucide-react";

const mockEvents = [
  { id: 1, name: "Project Kick-off", description: "Initial meeting for the new project.", location: "Online", dateTime: "2025-07-01T10:00:00", organizers: ["Alice"], attendees: 12, isOrganizer: true, status: "upcoming" },
  { id: 2, name: "Design Sprint", description: "Week-long design sprint.", location: "Office 301", dateTime: "2025-07-05T09:00:00", organizers: ["Bob"], attendees: 8, isOrganizer: false, status: "upcoming" },
  { id: 3, name: "Quarterly Review", description: "Review of Q2 performance.", location: "Conference Hall", dateTime: "2025-06-10T14:00:00", organizers: ["Charlie"], attendees: 25, isOrganizer: false, status: "occurred" },
  { id: 4, name: "Team Lunch", description: "Cancelled due to weather.", location: "The Grand Cafe", dateTime: "2025-06-14T12:30:00", organizers: ["Alice"], attendees: 10, isOrganizer: true, status: "cancelled" },
];

const EventsWindow = () => {
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
              <h4 className="font-medium leading-none">Filter Events</h4>
              <div className="grid gap-2">
                <Label>Status</Label>
                <ToggleGroup type="single" defaultValue="upcoming" variant="outline">
                  <ToggleGroupItem value="upcoming" className="w-full">Upcoming</ToggleGroupItem>
                  <ToggleGroupItem value="occurred" className="w-full">Occurred</ToggleGroupItem>
                </ToggleGroup>
              </div>
               <div className="grid gap-2">
                <Label>Visibility</Label>
                <ToggleGroup type="single" variant="outline">
                  <ToggleGroupItem value="my-events" className="w-full">My Events</ToggleGroupItem>
                  <ToggleGroupItem value="attended-events" className="w-full">Attended</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="show-cancelled" />
                <Label htmlFor="show-cancelled">Show Cancelled Events</Label>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockEvents.map(event => <EventCard key={event.id} event={event} />)}
      </div>
    </div>
  )
}

export default EventsWindow;
