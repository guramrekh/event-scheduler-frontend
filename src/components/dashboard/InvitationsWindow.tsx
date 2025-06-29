import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Check, X, Star, Users, Inbox, CheckCircle, XCircle, Clock, Mail } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import api from "@/lib/api";


const UserSummaryModal = ({ user, children }: { user: any; children: React.ReactNode }) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profilePictureUrl} alt={fullName} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{fullName}</DialogTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
            {user.bio && (
              <div className="pt-4 border-t">
                <p className="text-base text-foreground whitespace-pre-line break-words">{user.bio}</p>
              </div>
            )}
          </div>
        </DialogHeader>
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

  // Empty state content based on filter
  const getEmptyStateContent = () => {
    switch (filter) {
      case "PENDING":
        return {
          icon: <Inbox className="h-16 w-16 text-muted-foreground" />,
          title: "No Pending Invitations",
          subtitle: "When someone invites you to an event, it'll appear here for you to accept or decline."
        };
      case "ACCEPTED":
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: "No Accepted Invitations",
          subtitle: "Accepted invitations will show here, and you can view them in your main events list."
        };
      case "DECLINED":
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: "No Declined Invitations",
          subtitle: "You haven't had to decline any invitations yet."
        };
      case "EXPIRED":
        return {
          icon: <Clock className="h-16 w-16 text-orange-500" />,
          title: "No Expired Invitations",
          subtitle: "Expired invitations will be listed here if you don't respond in time."
        };
      default:
        return {
          icon: <Mail className="h-16 w-16 text-muted-foreground" />,
          title: "No Invitations",
          description: "You don't have any invitations in this category.",
          subtitle: "Check other tabs to see different types of invitations."
        };
    }
  };

  const emptyState = getEmptyStateContent();

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
      
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : invitations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {invitations.map(invite => (
            <InvitationCard key={invite.id} invitation={invite} onRespond={handleRespond} loading={loading} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6">
            {emptyState.icon}
          </div>
          <h2 className="text-2xl font-semibold mb-2">{emptyState.title}</h2>
          <p className="text-muted-foreground mb-4 max-w-md">{emptyState.description}</p>
          <p className="text-sm text-muted-foreground max-w-md">{emptyState.subtitle}</p>
        </div>
      )}
    </div>
  );
};

export default InvitationsWindow;
