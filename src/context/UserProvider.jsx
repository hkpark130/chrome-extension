import { isChromeExtension } from "@/api/utils";
import { UserProvider as UserProviderDev } from "./UserProviderDev";
import { UserProvider as UserProviderExtension } from "./UserProviderExtension";
import { useUser as useUserDev } from "./UserProviderDev";
import { useUser as useUserExtension } from "./UserProviderExtension";

export const UserProvider = isChromeExtension() ? UserProviderExtension : UserProviderDev;
export const useUser = isChromeExtension() ? useUserExtension : useUserDev;
