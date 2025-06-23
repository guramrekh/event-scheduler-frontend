import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string;
  attendedEventsCount: number;
  organizedEventsCount: number;
  withdrawnFromEventsCount: number;
  kickedOutFromEventsCount: number;
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  updateUser: (updates: Partial<UserData>) => void;
  clearUserState: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);

  const updateUser = (updates: Partial<UserData>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const clearUserState = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, clearUserState }}>
      {children}
    </UserContext.Provider>
  );
}; 