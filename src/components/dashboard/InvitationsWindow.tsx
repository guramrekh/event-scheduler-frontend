import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Check, X, Star, Users } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import axios from "axios";
import api from "@/lib/api";


const UserSummaryModal = ({ user, children }: { user: any; children: React.ReactNode }) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={fullName} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{fullName}</DialogTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">User details and event history could go here.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};


const InvitationCard = ({ invitation, onRespond, loading }: { invitation: any; onRespond: (id: number, status: string) => void; loading: boolean }) => {
  const { id, invitor, event, invitationSentDate, status } = invitation;
  const formattedEventDate = new Date(event.dateTime).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const sentDateObj = new Date(invitationSentDate);
  const formattedSentDate = sentDateObj.toLocaleString('en-US', {
    year: '2-digit', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true
  }).replace(',', '').replace(/(\d{2}):(\d{2})/, '$1:$2');
  const totalParticipants = event.organizers.length + event.attendees.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>
          <div className="flex items-center justify-between w-full">
            <div>
              Invited by{' '}
              <UserSummaryModal user={invitor}>
                <span className="font-medium text-primary hover:underline cursor-pointer">
                  {invitor.firstName} {invitor.lastName}
                </span>
              </UserSummaryModal>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{formattedSentDate}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formattedEventDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{event.location}</span>
        </div>
        {event.description && (
          <div className="mt-2 max-h-12 overflow-y-auto text-sm leading-relaxed">
            {event.description}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Popover>
            <PopoverTrigger asChild>
              <span className="cursor-pointer underline text-muted-foreground">
                {totalParticipants} Participants
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {event.organizers.length > 0 && (
                    <div>
                      {event.organizers.map((organizer) => (
                        <div key={organizer.id} className="flex items-center gap-2">
                          <UserSummaryModal user={organizer}>
                            <span className="font-medium text-primary hover:underline cursor-pointer text-sm flex items-center gap-1">
                              {organizer.firstName} {organizer.lastName}
                              <Star className="h-4 w-4 text-yellow-500 inline" />
                            </span>
                          </UserSummaryModal>
                        </div>
                      ))}
                    </div>
                  )}
                  {event.attendees.length > 0 ? (
                    event.attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center gap-2">
                        <UserSummaryModal user={attendee}>
                          <span className="font-medium text-primary hover:underline cursor-pointer text-sm flex items-center gap-1">
                            {attendee.firstName} {attendee.lastName}
                          </span>
                        </UserSummaryModal>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No attendees yet.</p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
      {status === "PENDING" && (
        <CardFooter className="flex gap-2">
          <Button type="button" className="w-full" onClick={() => onRespond(id, "ACCEPTED")} disabled={loading}> <Check className="mr-1 h-4 w-4" />Accept</Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => onRespond(id, "DECLINED")} disabled={loading}> <X className="mr-1 h-4 w-4" />Decline</Button>
        </CardFooter>
      )}
    </Card>
  );
};

const InvitationsWindow = () => {
  const [filter, setFilter] = useState("PENDING");
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/invitations", { params: { status: filter } })
      .then(res => setInvitations(res.data))
      .catch(() => setInvitations([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleRespond = (id: number, status: string) => {
    api.put(`/invitations/${id}/respond`, null, {
      params: { newStatus: status },
    }).then(res => {
      setInvitations(prev => prev.filter(inv => inv.id !== id || res.data.status === filter));
    });
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Invitations</h1>
        <ToggleGroup type="single" value={filter} onValueChange={value => value && setFilter(value.toUpperCase())} variant="outline">
          <ToggleGroupItem value="PENDING" className="w-24">Pending</ToggleGroupItem>
          <ToggleGroupItem value="ACCEPTED" className="w-24">Accepted</ToggleGroupItem>
          <ToggleGroupItem value="DECLINED" className="w-24">Declined</ToggleGroupItem>
          <ToggleGroupItem value="EXPIRED" className="w-24">Expired</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {invitations.map(invite => (
          <InvitationCard key={invite.id} invitation={invite} onRespond={handleRespond} loading={loading} />
        ))}
      </div>
    </div>
  );
};

export default InvitationsWindow;
