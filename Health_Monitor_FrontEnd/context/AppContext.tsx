import HealthData from "@/constants/HealthData";
import User from "@/constants/User";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
} from "react";

import { Dispatch } from "react";

interface AppContextProps {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  healthData: HealthData[];
  setHealthData: Dispatch<SetStateAction<HealthData[]>>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(null);
  const [healthData, setHealthData] = useState<HealthData[]>(null);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        healthData,
        setHealthData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
