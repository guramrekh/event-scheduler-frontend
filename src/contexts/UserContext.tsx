import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface UserContextType {
  currentUser: UserData | null;
  setCurrentUser: (user: UserData | null) => void;
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
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  const clearUserState = () => {
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, clearUserState }}>
      {children}
    </UserContext.Provider>
  );
}; 