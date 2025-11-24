import React, { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Keyboard,
  TextInput as RNTextInput,
  ScrollView as RNScrollView,
  LayoutChangeEvent,
  KeyboardTypeOptions,
  StyleProp,
  ViewStyle,
} from "react-native";
import KycShimmer from "../../../skeleton/KycShimmer";
import { toast } from "../../../utils/Toast";
import { SaveKyc } from "../../../services/ProfileService";
import { KycFormState } from "../../../types/types";

const HEADER_IMAGE = "/mnt/data/WhatsApp Image 2025-11-24 at 22.07.17.jpeg";

const DEFAULT_FORM: KycFormState = {
  aadhaar: "",
  aadhaarName: "",
  dob: "",
  pan: "",
  bankAccount: "",
  bankName: "",
  ifsc: "",
  mobile: "",
  email: "",
};

function wait(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  autoCapitalize,
  containerStyle,
  inputRef,
  onFocus,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  containerStyle?: StyleProp<ViewStyle>;
  inputRef?: React.RefObject<RNTextInput | null>;
  onFocus?: React.ComponentProps<typeof TextInput>["onFocus"];
  onBlur?: React.ComponentProps<typeof TextInput>["onBlur"];
}): JSX.Element {
  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={inputRef as React.RefObject<RNTextInput>}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
        onFocus={onFocus}
        onBlur={onBlur}
        returnKeyType="done"
        underlineColorAndroid="transparent"
      />
    </View>
  );
}

export default function KYCVerifyPage(): JSX.Element {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [form, setForm] = useState<KycFormState>(DEFAULT_FORM);

  // which field is focused; when not null, Save button is hidden
  const [focusedField, setFocusedField] = useState<keyof KycFormState | null>(null);

  const scrollRef = useRef<RNScrollView | null>(null);
  const mounted = useRef<boolean>(true);

  // cached Y layout positions (content coordinates)
  const fieldY = useRef<Partial<Record<keyof KycFormState, number>>>({});

  // refs for inputs (nullable)
  const inputRefs: Record<keyof KycFormState, React.RefObject<RNTextInput | null>> = {
    aadhaar: useRef<RNTextInput | null>(null),
    aadhaarName: useRef<RNTextInput | null>(null),
    dob: useRef<RNTextInput | null>(null),
    pan: useRef<RNTextInput | null>(null),
    bankAccount: useRef<RNTextInput | null>(null),
    bankName: useRef<RNTextInput | null>(null),
    ifsc: useRef<RNTextInput | null>(null),
    mobile: useRef<RNTextInput | null>(null),
    email: useRef<RNTextInput | null>(null),
  };

  useEffect(() => {
    mounted.current = true;
    const t = setTimeout(() => {
      if (mounted.current) setLoading(false);
    }, 600);

    const showSub = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardHeight(e.endCoordinates?.height ?? 0)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));

    return () => {
      mounted.current = false;
      clearTimeout(t);
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const setField = useCallback((k: keyof KycFormState, v: string) => {
    setForm((s) => ({ ...s, [k]: v }));
  }, []);

  const onLayoutCapture = useCallback((key: keyof KycFormState) => (e: LayoutChangeEvent) => {
    // cache the Y coordinate (relative to the ScrollView content)
    fieldY.current[key] = e.nativeEvent.layout.y;
  }, []);

  // Scroll the field into view above the keyboard.
  // Uses cached onLayout y when available.
  const ensureVisible = useCallback(
    async (key: keyof KycFormState) => {
      const cached = fieldY.current[key];
      const margin = 14;

      if (typeof cached === "number" && scrollRef.current) {
        const target = Math.max(0, cached - margin);
        // try to account for keyboard height by pushing target up slightly
        const adjusted = Math.max(0, target - keyboardHeight);
        scrollRef.current.scrollTo({ y: adjusted, animated: true });
      }
      // if we don't have cached layout, do nothing — this avoids unsafe measurements
    },
    [keyboardHeight]
  );

  const handleFocus = useCallback(
    (key: keyof KycFormState): React.ComponentProps<typeof TextInput>["onFocus"] =>
      () => {
        setFocusedField(key);
        // fire-and-forget; ensureVisible is safe
        void ensureVisible(key);
      },
    [ensureVisible]
  );

  const handleBlur = useCallback(
    (key: keyof KycFormState): React.ComponentProps<typeof TextInput>["onBlur"] =>
      () => {
        // small delay to allow focus to move between inputs without flicker
        setTimeout(() => {
          setFocusedField((current) => (current === key ? null : current));
        }, 50);
      },
    []
  );

  const onSave = useCallback(async () => {
    setSaving(true);
    try {
      const params = { ...form };
      await wait(250);
      const res = await SaveKyc(params);
      if (res?.code === 200) toast.success(res.message || "KYC saved successfully.");
      else toast.error(res?.message || "Unable to continue. Please try again.");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && (err as { message?: string }).message
          ? (err as { message?: string }).message
          : "Unable to continue. Please try again.";
      toast.error(message);
    } finally {
      if (mounted.current) setSaving(false);
    }
  }, [form]);

  const horizontalPadding = useMemo(
    () => Math.min(28, Math.max(16, Math.floor(width * 0.05))),
    [width]
  );

  const contentBottomPadding = Math.max(160, keyboardHeight + 20);
  const saveBottom = Platform.OS === "ios" ? Math.max(20, keyboardHeight) : Math.max(12, keyboardHeight);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 64}
        style={styles.flex}
      >
        <View style={[styles.headerRow, { paddingHorizontal: horizontalPadding }]}>
          <Image source={{ uri: HEADER_IMAGE }} style={styles.headerImage} resizeMode="cover" />
          <Text style={styles.headerTitle}>KYC Verification</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scroll,
            { paddingHorizontal: horizontalPadding, paddingBottom: contentBottomPadding },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.placeholderStack}>
              <KycShimmer style={{ height: 84, borderRadius: 12, marginBottom: 12 }} />
              <KycShimmer style={{ height: 44, borderRadius: 8, marginBottom: 10 }} />
              <KycShimmer style={{ height: 44, borderRadius: 8, marginBottom: 10 }} />
              <KycShimmer style={{ height: 44, borderRadius: 8, marginBottom: 10 }} />
            </View>
          ) : (
            <>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Aadhar Card Details</Text>

                <View style={isWide ? styles.row : undefined}>
                  <View style={isWide ? styles.col : undefined} onLayout={onLayoutCapture("aadhaar")}>
                    <LabeledInput
                      label="Aadhar Card Number"
                      value={form.aadhaar}
                      onChange={(v) => setField("aadhaar", v)}
                      placeholder="9999 9123 4545 XXXX"
                      keyboardType="number-pad"
                      containerStyle={undefined}
                      inputRef={inputRefs.aadhaar}
                      onFocus={handleFocus("aadhaar")}
                      onBlur={handleBlur("aadhaar")}
                    />
                  </View>

                  <View style={isWide ? [styles.col, styles.colGap] : undefined} onLayout={onLayoutCapture("aadhaarName")}>
                    <LabeledInput
                      label="Full Name as on Aadhar Card"
                      value={form.aadhaarName}
                      onChange={(v) => setField("aadhaarName", v)}
                      placeholder="Full name"
                      inputRef={inputRefs.aadhaarName}
                      onFocus={handleFocus("aadhaarName")}
                      onBlur={handleBlur("aadhaarName")}
                    />
                  </View>
                </View>

                <View onLayout={onLayoutCapture("dob")}>
                  <LabeledInput
                    label="Date of Birth as on Aadhar Card"
                    value={form.dob}
                    onChange={(v) => setField("dob", v)}
                    placeholder="DD-MM-YYYY"
                    inputRef={inputRefs.dob}
                    onFocus={handleFocus("dob")}
                    onBlur={handleBlur("dob")}
                  />
                </View>
              </View>

              <View style={styles.sectionCard} onLayout={onLayoutCapture("pan")}>
                <Text style={styles.sectionTitle}>Pan Card Details</Text>
                <LabeledInput
                  label="Pan Card Number"
                  value={form.pan}
                  onChange={(v) => setField("pan", v.toUpperCase())}
                  placeholder="XXXXX1234X"
                  autoCapitalize="characters"
                  inputRef={inputRefs.pan}
                  onFocus={handleFocus("pan")}
                  onBlur={handleBlur("pan")}
                />
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Bank Details</Text>

                <View style={isWide ? styles.row : undefined}>
                  <View style={isWide ? styles.col : undefined} onLayout={onLayoutCapture("bankAccount")}>
                    <LabeledInput
                      label="Bank Account Number"
                      value={form.bankAccount}
                      onChange={(v) => setField("bankAccount", v)}
                      placeholder="Account number"
                      keyboardType="number-pad"
                      inputRef={inputRefs.bankAccount}
                      onFocus={handleFocus("bankAccount")}
                      onBlur={handleBlur("bankAccount")}
                    />
                  </View>

                  <View style={isWide ? [styles.col, styles.colGap] : undefined} onLayout={onLayoutCapture("bankName")}>
                    <LabeledInput
                      label="Bank Name"
                      value={form.bankName}
                      onChange={(v) => setField("bankName", v)}
                      placeholder="Bank name"
                      inputRef={inputRefs.bankName}
                      onFocus={handleFocus("bankName")}
                      onBlur={handleBlur("bankName")}
                    />
                  </View>
                </View>

                <View onLayout={onLayoutCapture("ifsc")}>
                  <LabeledInput
                    label="IFSC Code"
                    value={form.ifsc}
                    onChange={(v) => setField("ifsc", v.toUpperCase())}
                    placeholder="IFSC"
                    autoCapitalize="characters"
                    inputRef={inputRefs.ifsc}
                    onFocus={handleFocus("ifsc")}
                    onBlur={handleBlur("ifsc")}
                  />
                </View>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Contact Details</Text>

                <View style={isWide ? styles.row : undefined}>
                  <View style={isWide ? styles.col : undefined} onLayout={onLayoutCapture("mobile")}>
                    <LabeledInput
                      label="Mobile Number"
                      value={form.mobile}
                      onChange={(v) => setField("mobile", v)}
                      placeholder="Mobile number"
                      keyboardType="phone-pad"
                      inputRef={inputRefs.mobile}
                      onFocus={handleFocus("mobile")}
                      onBlur={handleBlur("mobile")}
                    />
                  </View>

                  <View style={isWide ? [styles.col, styles.colGap] : undefined} onLayout={onLayoutCapture("email")}>
                    <LabeledInput
                      label="Email ID"
                      value={form.email}
                      onChange={(v) => setField("email", v)}
                      placeholder="you@domain.com"
                      keyboardType="email-address"
                      inputRef={inputRefs.email}
                      onFocus={handleFocus("email")}
                      onBlur={handleBlur("email")}
                    />
                  </View>
                </View>
              </View>

              <View style={{ height: 120 }} />
            </>
          )}
        </ScrollView>

        {focusedField === null && (
          <View style={[styles.saveContainer, { bottom: saveBottom, paddingHorizontal: horizontalPadding }]}>
            <Pressable
              style={[styles.saveBtn, saving && styles.saveBtnDisabled, { width: Math.min(width - horizontalPadding * 2, 680) }]}
              onPress={onSave}
              disabled={saving}
              android_ripple={{ color: "rgba(255,255,255,0.08)" }}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F7F8" },
  flex: { flex: 1 },

  headerRow: { height: 64, justifyContent: "center" },
  headerImage: { position: "absolute", left: 0, right: 0, top: 0, height: 90, opacity: 0.06 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111", marginLeft: 6 },

  scroll: { paddingTop: 10 },

  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12, color: "#222" },

  label: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },

  input: {
    width: "100%",
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
    marginBottom: 12,
    marginTop: 4,
  },

  row: { flexDirection: "row" },
  col: { flex: 1 },
  colGap: { marginRight: 12 },

  saveContainer: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  saveBtn: { height: 52, borderRadius: 26, backgroundColor: "#561313", alignItems: "center", justifyContent: "center", elevation: 3 },
  saveBtnDisabled: { backgroundColor: "#9E2B2B" },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  placeholderStack: { marginTop: 8 },
});
