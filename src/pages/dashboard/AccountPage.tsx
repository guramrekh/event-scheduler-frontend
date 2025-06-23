import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { updateUserProfile, resetPassword, deleteAccount } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, UserX, LogOut, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useNavigate } from "react-router-dom";
import ProfilePictureUploader from "@/components/dashboard/ProfilePictureUploader";

const AccountPage = () => {
  const { user, updateUser, clearUserState } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    bio: user?.bio || "",
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateUserProfile(profileForm);
      updateUser({ ...user, ...profileForm });
      setIsEditingProfile(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await resetPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmPassword,
      });
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please check your current password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteAccount();
      clearUserState();
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      navigate("/", { replace: true });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <Avatar
                  className="h-20 w-20 cursor-pointer border-2 border-transparent group-hover:border-primary transition"
                  onClick={() => setAvatarModalOpen(true)}
                >
                  {user?.profilePictureUrl ? (
                    <AvatarImage src={user.profilePictureUrl} alt={user?.firstName} />
                  ) : null}
                  <AvatarFallback className="text-2xl">
                    {getInitials(user?.firstName || "", user?.lastName || "")}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-primary text-white text-xs rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition pointer-events-none">Change</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-1">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-lg text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            {user?.bio && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-base text-foreground whitespace-pre-line break-words">{user.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEditingProfile ? (
              <Button onClick={() => setIsEditingProfile(true)} className="w-full">
                Edit Profile
              </Button>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, firstName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="w-full min-h-[80px] rounded border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={profileForm.bio}
                    onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                    maxLength={500}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileForm({
                        firstName: user?.firstName || "",
                        lastName: user?.lastName || "",
                        bio: user?.bio || "",
                      });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}


            {!isChangingPassword ? (
              <Button onClick={() => setIsChangingPassword(true)} variant="outline" className="w-full">
                Change Password
              </Button>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Changing..." : "Change Password"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}


            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete your account? This action cannot be undone. 
                    All your data, events, and invitations will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      {/* Event Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Event Statistics</CardTitle>
          <CardDescription>
            Overview of your event participation and organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-black/50 border border-black">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-green-400">
                {user?.attendedEventsCount || 0}
              </div>
              <div className="text-sm text-gray-300">Events Attended</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-black/50 border border-black">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-blue-400">
                {user?.organizedEventsCount || 0}
              </div>
              <div className="text-sm text-gray-300">Events Organized</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-black/50 border border-black">
              <LogOut className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-yellow-400">
                {user?.withdrawnFromEventsCount || 0}
              </div>
              <div className="text-sm text-gray-300">Withdrawn From</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-black/50 border border-black">
              <UserX className="h-8 w-8 mx-auto mb-2 text-red-400" />
              <div className="text-2xl font-bold text-red-400">
                {user?.kickedOutFromEventsCount || 0}
              </div>
              <div className="text-sm text-gray-300">Kicked Out From</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ProfilePictureUploader
        value={user?.profilePictureUrl}
        fallback={getInitials(user?.firstName || '', user?.lastName || '')}
        onUpload={(url) => {
          updateUser({ profilePictureUrl: url });
          setAvatarModalOpen(false);
        }}
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
      />
    </div>
  );
};

export default AccountPage; 