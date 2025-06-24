import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
          <div className="space-y-4">
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

export default UserProfile;
