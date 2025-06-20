import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Calendar, User, Users, Mail, Star, Settings, LogOut, Edit, UserPlus, UserMinus, UserX, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { withdrawFromEvent, editEvent, cancelEvent, addAsOrganizer, removeAsOrganizer, kickOutAttendee } from "@/lib/api";
import { Checkbox } from '@/components/ui/checkbox';
import { getUserByEmail, getUsersByName, inviteUser } from "@/lib/api";

// User type for organizers and attendees
interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

// Type for search results
interface SearchUserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

// Type for the event data from backend
interface EventData {
  id: number;
  title: string;
  description?: string;
  dateTime: string;
  location: string;
  isCancelled: boolean;
  organizers: UserData[];
  attendees: UserData[];
}

// Type for the wrapper DTO that includes role
interface EventWithRoleDto {
  event: EventData;
  role: "ORGANIZER" | "ATTENDEE" | null;
}

interface EventCardProps {
  eventWithRole: EventWithRoleDto;
  onEventUpdate?: () => void;
}

// User Summary Modal Component
const UserSummaryModal: React.FC<{ user: UserData; children: React.ReactNode }> = ({ user, children }) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
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
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Here you could see user's event history, preferences, or other details.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Event Management Modal for Organizers
const EventManagementModal: React.FC<{ event: EventData; onEventUpdate?: () => void; children: React.ReactNode }> = ({ event, onEventUpdate, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState({
    title: event.title,
    description: event.description || '',
    dateTime: new Date(event.dateTime).toISOString().slice(0, 16),
    location: event.location
  });
  const [loading, setLoading] = useState(false);
  const [notifyParticipants, setNotifyParticipants] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserData[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<Set<number>>(new Set());

  const handleEditEvent = async () => {
    setLoading(true);
    try {
      await editEvent(event.id, editData, notifyParticipants);
      onEventUpdate?.();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to edit event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEvent = async () => {
    setLoading(true);
    try {
      await cancelEvent(event.id);
      onEventUpdate?.();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to cancel event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawFromEvent = async () => {
    setLoading(true);
    try {
      await withdrawFromEvent(event.id);
      onEventUpdate?.();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to withdraw from event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrganizer = async (userId: number) => {
    setLoading(true);
    try {
      await addAsOrganizer(event.id, userId);
      onEventUpdate?.();
    } catch (error) {
      console.error('Failed to add organizer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveOrganizer = async (userId: number) => {
    setLoading(true);
    try {
      await removeAsOrganizer(event.id, userId);
      onEventUpdate?.();
    } catch (error) {
      console.error('Failed to remove organizer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKickOutAttendee = async (userId: number) => {
    setLoading(true);
    try {
      await kickOutAttendee(event.id, userId);
      onEventUpdate?.();
    } catch (error) {
      console.error('Failed to kick out attendee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);
    try {
      if (searchQuery.includes('@')) {
        const response = await getUserByEmail(searchQuery);
        setSearchResults(response.data ? [response.data] : []);
      } else {
        // Split by space for first and last name
        const parts = searchQuery.trim().split(' ');
        if (parts.length >= 2) {
          const firstName = parts[0];
          const lastName = parts.slice(1).join(' ');
          const response = await getUsersByName(firstName, lastName);
          setSearchResults(response.data || []);
        } else {
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInvite = async (userId: number) => {
    setInviteLoading(userId);
    try {
      await inviteUser(event.id, userId);
      onEventUpdate?.();
      // Mark user as invited instead of removing from results
      setInvitedUsers(prev => new Set(prev).add(userId));
    } catch (error) {
      console.error('Failed to invite user:', error);
    } finally {
      setInviteLoading(null);
    }
  };

  // Filter out users who are already organizers or attendees
  const filteredSearchResults = searchResults.filter(user => 
    !event.organizers.some(org => org.id === user.id) &&
    !event.attendees.some(att => att.id === user.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Manage '{event.title}'</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dateTime">Date & Time</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                value={editData.dateTime}
                onChange={(e) => setEditData(prev => ({ ...prev, dateTime: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editData.location}
                onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="notify" checked={notifyParticipants} onCheckedChange={(checked) => setNotifyParticipants(!!checked)} />
              <Label htmlFor="notify">Notify participants</Label>
            </div>
            <Button onClick={handleEditEvent} disabled={loading} className="mt-2">
              <Edit className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>

          <div className="grid gap-4">
            <h3 className="text-lg font-semibold underline">Organizers</h3>
            <div className="grid gap-2 max-h-32 overflow-y-auto">
              {event.organizers.map((organizer) => (
                <div key={organizer.id} className="flex items-center justify-between">
                  <span className="text-base">{organizer.firstName} {organizer.lastName}</span>
                  {event.organizers.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Organizer</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {organizer.firstName} {organizer.lastName} as an organizer?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveOrganizer(organizer.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="text-lg font-semibold underline">Attendees</h3>
            <div className="grid gap-2 max-h-32 overflow-y-auto">
              {event.attendees.map((attendee) => (
                <div key={attendee.id} className="flex items-center justify-between">
                  <span className="text-base">{attendee.firstName} {attendee.lastName}</span>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Add as Organizer</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to make {attendee.firstName} {attendee.lastName} an organizer?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleAddOrganizer(attendee.id)}>
                            Add as Organizer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <UserX className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Kick Out Attendee</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to kick out {attendee.firstName} {attendee.lastName} from this event?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleKickOutAttendee(attendee.id)}>
                            Kick Out
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Invite Users</h3>
            <div className="grid gap-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by email or name (e.g., Kevin Durant)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searchLoading}>
                  {searchLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
              
              {filteredSearchResults.length > 0 && (
                <div className="grid gap-2 max-h-40 overflow-y-auto">
                  {filteredSearchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={`${user.firstName} ${user.lastName}`} />
                          <AvatarFallback className="text-xs">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleInvite(user.id)}
                        disabled={inviteLoading === user.id || invitedUsers.has(user.id)}
                      >
                        {inviteLoading === user.id ? 'Inviting...' : invitedUsers.has(user.id) ? 'Invited' : 'Send Invite'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {hasSearched && !searchLoading && searchQuery.trim() && filteredSearchResults.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No users found matching your search.
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="grid gap-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Event
                  </Button>
                </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Event</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this event? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No, keep event</AlertDialogCancel>
                          <AlertDialogAction onClick={handleCancelEvent}>
                            Yes, cancel event
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
              </AlertDialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />Withdraw
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Withdraw from Event</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to withdraw from this event?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleWithdrawFromEvent}>
                      Withdraw
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EventCard: React.FC<EventCardProps> = ({ eventWithRole, onEventUpdate }) => {
  const [loading, setLoading] = useState(false);
  const { event, role } = eventWithRole;
  
  const formattedDate = new Date(event.dateTime).toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  });

  const isUpcoming = new Date(event.dateTime) > new Date();
  
  const canWithdraw = role === "ATTENDEE" && isUpcoming && !event.isCancelled;
  const canManage = role === "ORGANIZER";

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      await withdrawFromEvent(event.id);
      onEventUpdate?.();
    } catch (error) {
      console.error('Failed to withdraw from event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`flex flex-col ${event.isCancelled ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={event.isCancelled ? 'line-through' : ''}>
              {event.title}
            </CardTitle>
            {event.description && (
              <CardDescription className={`${event.isCancelled ? 'line-through' : ''} mt-2 max-h-12 overflow-y-auto text-sm leading-relaxed`}>
                {event.description}
              </CardDescription>
            )}
          </div>
          {event.isCancelled && (
            <Badge variant="destructive" className="ml-2">Cancelled</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm flex-grow pt-0">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className={event.isCancelled ? 'line-through' : ''}>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className={event.isCancelled ? 'line-through' : ''}>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Organized by{' '}
            {event.organizers.map((organizer, index) => (
              <React.Fragment key={organizer.id}>
                <UserSummaryModal user={organizer}>
                  <span className="font-medium text-primary hover:underline cursor-pointer">
                    {organizer.firstName} {organizer.lastName.charAt(0)}.
                  </span>
                </UserSummaryModal>
                {index < event.organizers.length - 1 && ', '}
              </React.Fragment>
            ))}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Popover>
            <PopoverTrigger asChild>
              <span className="cursor-pointer underline text-muted-foreground">
                {event.attendees.length + event.organizers.length} Participants
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

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          {canManage && (
            <EventManagementModal event={event} onEventUpdate={onEventUpdate}>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </EventManagementModal>
          )}
          
          {canWithdraw && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={loading}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Withdraw from Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to withdraw from "{event.title}"? You will no longer be an attendee of this event.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleWithdraw}>
                    Yes, withdraw
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
