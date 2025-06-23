import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail } from "lucide-react";

const UserProfile = ({ user }) => {
  const initials = `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="font-medium text-primary hover:underline cursor-pointer">{user.firstName} {user.lastName}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profilePictureUrl} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{user.firstName} {user.lastName}</DialogTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Here you could see user's event history or other details.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
