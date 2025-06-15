
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Calendar, User, UserX } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditEventForm from "./EditEventForm";

const EventCard = ({ event }) => {
  const formattedDate = new Date(event.dateTime).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
        <CardDescription>{event.description}</CardDescription>
        {event.status === 'cancelled' && <Badge variant="destructive" className="w-fit">Cancelled</Badge>}
      </CardHeader>
      <CardContent className="grid gap-2 text-sm flex-grow">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>Organized by {event.organizers.join(", ")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-pointer underline">{event.attendees} attendees</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Attendee list would show here.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
      <CardFooter>
        {event.isOrganizer ? (
           <Dialog>
             <DialogTrigger asChild>
                <Button className="w-full">View Details</Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-[480px]">
               <DialogHeader>
                 <DialogTitle>{event.name}</DialogTitle>
                 <DialogDescription>{event.location}</DialogDescription>
               </DialogHeader>
               <Tabs defaultValue="actions">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="edit">Edit Details</TabsTrigger>
                </TabsList>
                <TabsContent value="actions">
                  <div className="flex flex-col gap-2 mt-4">
                    <p className="text-sm text-muted-foreground">Manage your event by adding or removing organizers, or cancel it if needed.</p>
                    <Button variant="outline">Add Organizer</Button>
                    <Button variant="outline">Remove Organizer</Button>
                    <Button variant="destructive">Cancel Event</Button>
                  </div>
                </TabsContent>
                <TabsContent value="edit">
                  <EditEventForm event={event} />
                </TabsContent>
               </Tabs>
             </DialogContent>
           </Dialog>
        ) : (
          event.status === 'upcoming' && <Button variant="outline" className="w-full"><UserX className="mr-2 h-4 w-4" />Withdraw</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventCard;
