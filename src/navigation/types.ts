import { DrawerContentComponentProps, DrawerNavigationProp } from "@react-navigation/drawer";
import { GestureResponderEvent, ImageSourcePropType } from "react-native";

export type RootStackParamList = {
  Home: undefined;
  Details: { id: string };
  Welcome: undefined;
  Login: undefined;
  Otp: { data: string };
  EmailLogin: undefined;
  Main: undefined;
};

export type DrawerParamList = {
  HomeTabs: undefined;
  Profile: undefined;
  KYCPage: undefined;
  Permissions: undefined;
};

export type MovieStackParamList = {
  MovieList: undefined;
  MovieDetails: { movieId: string };
};


export type TabDescriptor = {
  key: string;
  name: string;
  Icon: React.ComponentType<{ width?: number; height?: number; fill?: string; stroke?: string }>;
  label: string;
};

export type CustomTabBarExtraProps = {
  activeColor?: string;
  inactiveColor?: string;
  backgroundColor?: string;
};

export type NavProp = DrawerNavigationProp<DrawerParamList>;

export type ContestStackParamList = {
  ContestHome: undefined;
  ContestDetails: { contestId: string };
};

export type AppTabParamList = {
  Home: undefined;
  Contest: undefined;
  Coins: undefined;
  Reports: undefined;
};

export type DrawerProps = DrawerContentComponentProps & {
  backgroundImage?: ImageSourcePropType | string;
  avatarUri?: string | null;
};

export type MenuRowProps = {
  icon?: React.ReactNode;
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  testID?: string;
  active?: boolean;
};

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthContextValue = {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  signIn: (accessToken: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshState: () => Promise<void>;
};