import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Check, X } from "lucide-react";
import { mockInvitations } from "@/data/mockData";
import UserProfile from "./UserProfile";

const InvitationsWindow = () => {
  return (
    <div className="grid gap-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Pending Invitations</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockInvitations.map(invite => (
          <Card key={invite.id}>
            <CardHeader>
              <CardTitle>{invite.eventName}</CardTitle>
              <CardDescription>Invited by <UserProfile user={invite.inviter} /></CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(invite.dateTime).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{invite.location}</span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="w-full"><Check className="mr-2 h-4 w-4" /> Accept</Button>
              <Button variant="outline" className="w-full"><X className="mr-2 h-4 w-4" /> Decline</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default InvitationsWindow;
