import React, { JSX, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { SaveProfile, GetProfile } from '../../services/ProfileService';
import { SkeletonProfile } from '../../skeleton/ProfileSkeleton';
import { toast } from '../../utils/Toast';
import { ApiResponseWithUserData, UserPayload, UserResponse } from '../../types/types';
import { formatDisplayDate, parseDisplayDateToIso } from '../../utils/Helper';

const FALLBACK_AVATAR = require('../../assets/profile.png');

export default function ProfileScreen(): JSX.Element {
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserPayload>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: null,
    gender: '',
    maritalStatus: '',
    anniversaryDate: null,
    profilePicture: null,
    doorNumber: '',
    streetOrVillageName: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Responsive derived values
  const isWide = width >= 720;
  const avatarSize = Math.min(140, Math.max(88, Math.floor(width * 0.22)));
  const contentPadding = Math.min(28, Math.max(16, Math.floor(width * 0.05)));
  const bottomSpacing = Platform.OS === 'ios' ? 28 : 16;
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 88 : 64;

  const normalizeGender = (g?: string | null): '' | 'male' | 'female' | undefined => {
    if (!g) return '';
    const lower = g.toLowerCase();
    if (lower === 'male' || lower === 'm') return 'male';
    if (lower === 'female' || lower === 'f') return 'female';
    return '';
  };

  const normalizeMarital = (m?: string | null): '' | 'Single' | 'Married' | undefined => {
    if (!m) return '';
    if (m === 'Single' || m.toLowerCase() === 'single') return 'Single';
    if (m === 'Married' || m.toLowerCase() === 'married') return 'Married';
    return ''; // fallback for unknown values
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = (await GetProfile()) as ApiResponseWithUserData;
        if (!mounted) return;
        const u = res?.data?.user as UserResponse | undefined;
        if (res?.code === 200 && u) {
          setProfile({
            firstName: u.firstName ?? '',
            lastName: u.lastName ?? '',
            email: u.email ?? '',
            phoneNumber: u.phoneNumber ?? '',
            dateOfBirth: u.dateOfBirth ?? null,
            gender: normalizeGender(u.gender),
            maritalStatus: normalizeMarital(u.maritalStatus),
            anniversaryDate: u.anniversaryDate ?? null,
            profilePicture: u.profilePicture ?? null,
            doorNumber: u.doorNumber ?? '',
            streetOrVillageName: u.streetOrVillageName ?? '',
            city: u.city ?? '',
            state: u.state ?? '',
            pincode: u.pincode ?? '',
          });
        }
      } catch (e) {
        console.warn(e);
        toast.error('Unable to load profile');
      } finally {
        setTimeout(() => {
          if (mounted) setLoading(false);
        }, 220);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setField = useCallback(<K extends keyof UserPayload>(k: K, v: UserPayload[K]) => {
    setProfile((p) => ({ ...p, [k]: v }));
  }, []);

  const pickImage = useCallback(async () => {
    toast.error('Image picker not enabled');
  }, []);

  const onSave = useCallback(async () => {
    setSaving(true);
    try {
      await SaveProfile(profile);
      toast.success('Profile updated successfully.');
    } catch (e: unknown) {
      let message = 'Please try again.';

      if (e instanceof Error && e.message) {
        message = e.message;
      }

      toast.error(message);
    } finally {
      setSaving(false);
    }
  }, [profile]);

  // show skeleton while loading
  if (loading) {
    return <SkeletonProfile avatarSize={avatarSize} contentPadding={contentPadding} />;
  }

  const isSaveDisabled = saving;

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: Platform.OS === 'android' ? 8 : 0 }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={styles.flex}
      >
        <View style={styles.flex}>
          <View style={styles.flex}>
            <View style={[styles.header, { paddingHorizontal: contentPadding, paddingTop: 14 }]}>
              <Text style={styles.title}>Profile</Text>
            </View>

            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                { padding: contentPadding, paddingBottom: 160, flexGrow: 1 },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              nestedScrollEnabled={true}
            >
              {/* Centered avatar with name below */}
              <View style={[styles.centeredTop, { marginBottom: 18 }]}>
                <Pressable
                  style={[
                    styles.avatarTouch,
                    {
                      width: avatarSize,
                      height: avatarSize,
                      borderRadius: Math.max(12, Math.floor(avatarSize * 2.15)),
                    },
                  ]}
                  onPress={pickImage}
                  android_ripple={{ color: 'rgba(0,0,0,0.04)' }}
                >
                  <Image
                    source={
                      profile.profilePicture ? { uri: profile.profilePicture } : FALLBACK_AVATAR
                    }
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                </Pressable>

                <Text style={styles.centerName}>
                  {`${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || 'Your name'}
                </Text>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.label}>Mobile</Text>
                <TextInput
                  style={styles.input}
                  value={profile.phoneNumber}
                  onChangeText={(t) => setField('phoneNumber', t)}
                  keyboardType="phone-pad"
                  placeholder="Enter mobile"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={profile.email}
                  onChangeText={(t) => setField('email', t)}
                  keyboardType="email-address"
                  placeholder="Enter email"
                />
              </View>

              {/* spaced sections */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Personal</Text>

                <View style={[styles.row, isWide ? styles.rowHorizontal : styles.rowVertical]}>
                  <View style={[styles.col, isWide && styles.colGap]}>
                    <Text style={styles.label}>First name</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.firstName}
                      onChangeText={(t) => setField('firstName', t)}
                      placeholder="First name"
                    />
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.label}>Last name</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.lastName}
                      onChangeText={(t) => setField('lastName', t)}
                      placeholder="Last name"
                    />
                  </View>
                </View>

                <Text style={styles.label}>Date of birth</Text>
                <TextInput
                  style={styles.input}
                  value={formatDisplayDate(profile.dateOfBirth ?? '')}
                  onChangeText={(t) => setField('dateOfBirth', parseDisplayDateToIso(t ?? ''))}
                  placeholder="DD-MM-YYYY"
                />

                <View style={[styles.row, isWide ? styles.rowHorizontal : styles.rowVertical]}>
                  <View style={[styles.col, isWide && styles.colGap]}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.pillRow}>
                      <Pressable
                        style={[styles.pill, profile.gender === 'male' && styles.pillActive]}
                        onPress={() => setField('gender', 'male')}
                      >
                        <Text
                          style={[
                            styles.pillLabel,
                            profile.gender === 'male' && styles.pillLabelActive,
                          ]}
                        >
                          Male
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.pill, profile.gender === 'female' && styles.pillActive]}
                        onPress={() => setField('gender', 'female')}
                      >
                        <Text
                          style={[
                            styles.pillLabel,
                            profile.gender === 'female' && styles.pillLabelActive,
                          ]}
                        >
                          Female
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={[styles.col, isWide && styles.colGap]}>
                    <Text style={styles.label}>Marital</Text>
                    <View style={styles.pillRow}>
                      <Pressable
                        style={[
                          styles.pill,
                          profile.maritalStatus === 'Single' && styles.pillActive,
                        ]}
                        onPress={() => setField('maritalStatus', 'Single')}
                      >
                        <Text
                          style={[
                            styles.pillLabel,
                            profile.maritalStatus === 'Single' && styles.pillLabelActive,
                          ]}
                        >
                          Single
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.pill,
                          profile.maritalStatus === 'Married' && styles.pillActive,
                        ]}
                        onPress={() => setField('maritalStatus', 'Married')}
                      >
                        <Text
                          style={[
                            styles.pillLabel,
                            profile.maritalStatus === 'Married' && styles.pillLabelActive,
                          ]}
                        >
                          Married
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.col}>
                    <Text style={styles.label}>Anniversary</Text>
                    <TextInput
                      style={styles.input}
                      value={formatDisplayDate(profile.anniversaryDate ?? '')}
                      onChangeText={(t) =>
                        setField('anniversaryDate', parseDisplayDateToIso(t ?? ''))
                      }
                      placeholder="DD-MM-YYYY"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Address</Text>

                <Text style={styles.label}>Door / Flat no</Text>
                <TextInput
                  style={styles.input}
                  value={profile.doorNumber}
                  onChangeText={(t) => setField('doorNumber', t)}
                  placeholder="Door number"
                />

                <Text style={styles.label}>Street / Village</Text>
                <TextInput
                  style={styles.input}
                  value={profile.streetOrVillageName}
                  onChangeText={(t) => setField('streetOrVillageName', t)}
                  placeholder="Street or village"
                />

                <View style={[styles.row, isWide ? styles.rowHorizontal : styles.rowVertical]}>
                  <View style={[styles.col, isWide && styles.colGap]}>
                    <Text style={styles.label}>City</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.city}
                      onChangeText={(t) => setField('city', t)}
                      placeholder="City"
                    />
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.label}>State</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.state}
                      onChangeText={(t) => setField('state', t)}
                      placeholder="State"
                    />
                  </View>
                </View>

                <Text style={styles.label}>Pincode</Text>
                <TextInput
                  style={styles.input}
                  value={profile.pincode}
                  onChangeText={(t) => setField('pincode', t)}
                  keyboardType="number-pad"
                  placeholder="Pincode"
                />
              </View>

              <View style={{ height: Math.max(80, bottomSpacing + 60) }} />
            </ScrollView>

            {/* FIXED SAVE BUTTON */}
            <View
              pointerEvents={isSaveDisabled ? 'none' : 'auto'}
              style={[
                styles.fixedBottom,
                { bottom: Platform.OS === 'ios' ? 20 : 12, paddingHorizontal: contentPadding },
              ]}
            >
              <Pressable
                style={[
                  styles.saveBtn,
                  isSaveDisabled && styles.saveBtnDisabled,
                  { width: Math.min(width - contentPadding * 2, 680) },
                ]}
                onPress={onSave}
                disabled={isSaveDisabled}
                android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F8' },
  flex: { flex: 1 },
  header: { paddingBottom: 8, backgroundColor: '#F7F7F8' },
  title: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  scrollContent: { paddingBottom: 140 },
  centeredTop: {
    width: '100%',
    alignItems: 'center',
  },

  avatarTouch: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  avatar: { width: '100%', height: '100%' },
  centerName: { marginTop: 12, fontSize: 18, fontWeight: '700', color: '#111' },

  sectionCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, color: '#222' },

  label: { fontSize: 13, color: '#666', marginBottom: 6 },
  input: {
    width: '100%',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECECEC',
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
  },

  row: { width: '100%' },
  rowVertical: { flexDirection: 'column', gap: 12 },
  rowHorizontal: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  col: { flex: 1 },
  colGap: { marginRight: 6 },

  pillRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EDEDED',
    marginRight: 8,
    backgroundColor: '#FFF',
  },
  pillActive: { backgroundColor: '#561313', borderColor: '#561313' },
  pillLabel: { fontSize: 13, color: '#222' },
  pillLabelActive: { color: '#fff' },

  fixedBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  saveBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#561313',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  saveBtnDisabled: { backgroundColor: '#9E2B2B' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
