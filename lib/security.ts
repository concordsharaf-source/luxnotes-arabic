import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const PIN_KEY = "luxnotes.app-lock.pin";

function getWebStorage(): Storage | null {
  return typeof window !== "undefined" ? window.sessionStorage : null;
}

export async function savePin(pin: string): Promise<void> {
  if (Platform.OS === "web") {
    getWebStorage()?.setItem(PIN_KEY, pin);
    return;
  }
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

export async function verifyPin(pin: string): Promise<boolean> {
  if (Platform.OS === "web") return getWebStorage()?.getItem(PIN_KEY) === pin;
  return (await SecureStore.getItemAsync(PIN_KEY)) === pin;
}

export async function getPinLength(): Promise<number> {
  if (Platform.OS === "web") return getWebStorage()?.getItem(PIN_KEY)?.length ?? 0;
  return (await SecureStore.getItemAsync(PIN_KEY))?.length ?? 0;
}

export async function clearPin(): Promise<void> {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(PIN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(PIN_KEY);
}
