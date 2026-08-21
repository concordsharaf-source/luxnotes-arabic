import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as LocalAuthentication from "expo-local-authentication";
import { useEffect, useState } from "react";
import { AppState, Pressable, StyleSheet, Text, View } from "react-native";

import { NotebookMark } from "@/components/notebook-mark";
import { useColors } from "@/hooks/use-colors";
import { getPinLength, verifyPin } from "@/lib/security";
import { useNotebook } from "@/providers/notebook-provider";

export function AppLock({ children }: { children: React.ReactNode }) {
  const { data, isReady } = useNotebook();
  const colors = useColors();
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [lockInitialised, setLockInitialised] = useState(false);

  useEffect(() => {
    if (!isReady || lockInitialised) return;
    setLocked(data.settings.lockEnabled);
    setLockInitialised(true);
  }, [data.settings.lockEnabled, isReady, lockInitialised]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active" && data.settings.lockEnabled) setLocked(true);
    });
    return () => subscription.remove();
  }, [data.settings.lockEnabled]);

  useEffect(() => {
    if (!data.settings.lockEnabled) { setLocked(false); setPin(""); }
  }, [data.settings.lockEnabled]);

  const enterDigit = async (digit: string) => {
    if (pin.length >= 6) return;
    const next = `${pin}${digit}`;
    setPin(next);
    setError("");
    const savedPinLength = await getPinLength();
    if (savedPinLength > 0 && next.length >= savedPinLength) {
      const valid = await verifyPin(next);
      if (valid) { setLocked(false); setPin(""); }
      else { setError("رمز القفل غير صحيح"); setPin(""); }
    }
  };

  const unlockWithBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !enrolled) { setError("البصمة غير مهيأة على هذا الجهاز"); return; }
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: "افتح دفتر ملاحظاتك", cancelLabel: "إلغاء", fallbackLabel: "استخدم رمز القفل" });
    if (result.success) { setLocked(false); setPin(""); setError(""); }
  };

  if (!isReady || !locked) return <>{children}</>;
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><View style={styles.content}><NotebookMark /><View style={[styles.lockIcon, { backgroundColor: "#EEF0FF" }]}><MaterialIcons name="lock" size={33} color={colors.primary} /></View><Text style={[styles.title, { color: colors.foreground }]}>دفترك محمي</Text><Text style={[styles.description, { color: colors.muted }]}>أدخل رمز القفل للعودة إلى ملاحظاتك الخاصة.</Text><View style={styles.dots}>{Array.from({ length: 6 }).map((_, index) => <View key={index} style={[styles.dot, { borderColor: error ? "#D66767" : colors.border, backgroundColor: index < pin.length ? colors.primary : "transparent" }]} />)}</View>{error ? <Text style={styles.error}>{error}</Text> : <View style={styles.errorPlaceholder} />}{data.settings.biometricEnabled && <Pressable onPress={unlockWithBiometric} style={({ pressed }) => [styles.bioButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="fingerprint" size={22} color={colors.primary} /><Text style={[styles.bioText, { color: colors.foreground }]}>استخدام البصمة</Text></Pressable>}<View style={styles.keypad}>{[1,2,3,4,5,6,7,8,9].map((digit) => <Pressable key={digit} onPress={() => void enterDigit(String(digit))} style={({ pressed }) => [styles.key, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.keyText, { color: colors.foreground }]}>{digit}</Text></Pressable>)}<View style={styles.keyPlaceholder}/><Pressable onPress={() => void enterDigit("0")} style={({ pressed }) => [styles.key, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.keyText, { color: colors.foreground }]}>0</Text></Pressable><Pressable onPress={() => setPin((value) => value.slice(0, -1))} style={({ pressed }) => [styles.deleteKey, pressed && styles.pressed]}><MaterialIcons name="backspace" size={22} color={colors.muted} /></Pressable></View></View></View>;
}

const styles = StyleSheet.create({ screen: { ...StyleSheet.absoluteFillObject, zIndex: 100, alignItems: "center", justifyContent: "center", padding: 24 }, content: { width: "100%", maxWidth: 360, alignItems: "center" }, lockIcon: { marginTop: 31, height: 74, width: 74, borderRadius: 27, alignItems: "center", justifyContent: "center" }, title: { fontSize: 26, fontWeight: "900", marginTop: 19, writingDirection: "rtl" }, description: { fontSize: 14, textAlign: "center", lineHeight: 23, marginTop: 7, writingDirection: "rtl" }, dots: { flexDirection: "row", gap: 12, marginTop: 30 }, dot: { height: 13, width: 13, borderRadius: 9, borderWidth: 1.5 }, error: { color: "#C94E59", fontSize: 12, marginTop: 10, writingDirection: "rtl" }, errorPlaceholder: { height: 27 }, bioButton: { flexDirection: "row", gap: 8, alignItems: "center", paddingHorizontal: 17, paddingVertical: 11, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, marginBottom: 13 }, bioText: { fontSize: 14, fontWeight: "800", writingDirection: "rtl" }, keypad: { width: 258, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 }, key: { height: 54, width: 76, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth }, keyText: { fontSize: 20, fontWeight: "700" }, keyPlaceholder: { width: 76, height: 54 }, deleteKey: { height: 54, width: 76, alignItems: "center", justifyContent: "center" }, pressed: { opacity: 0.68, transform: [{ scale: 0.96 }] } });
