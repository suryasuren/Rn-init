import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Easing,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import CircleCheckbox from '../components/CircleCheckBox';
import Background from '../components/WelcomeBackGround';
import { Register, VerifyOtp } from '../services/AuthService';
import { RootStackParamList } from '../navigation/types';
import { toast } from '../utils/Toast';
import { Colors, Layout, Animation, Validation, Placeholders } from '../constants/constants';
import OtpInput, { OtpInputRef } from '../components/OtpInput';
import { useAuth } from '../auth/AuthProvider';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const { width, height } = Dimensions.get('window');
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export const UPLOADED_IMAGE_URI = '/mnt/data/8908c0ca-3a1f-4d59-b21c-cc84f1c43e98.png';

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const auth = useAuth();

  const [pendingTokens, setPendingTokens] = useState<{
    accessToken: string;
    refreshToken: string;
  } | null>(null);

  // inputs / flags
  const [mobile, setMobile] = useState('');
  const [isAdultMobile, setIsAdultMobile] = useState(false);
  const [loadingMobile, setLoadingMobile] = useState(false);

  const [email, setEmail] = useState('');
  const [isAdultEmail, setIsAdultEmail] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  // OTP
  const otpRef = useRef<OtpInputRef | null>(null);
  const [otp, setOtp] = useState('');
  const [otpSendingTo, setOtpSendingTo] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [rawIdentifier, setRawIdentifier] = useState<string | null>(null);

  const isValidMobile = mobile.length === Validation.MOBILE_LENGTH;
  const canContinueMobile = isValidMobile && isAdultMobile;
  const isValidEmail = Validation.EMAIL_REGEX.test(email);
  const canContinueEmail = isValidEmail && isAdultEmail;

  // animations + panes
  const anim = useRef(new Animated.Value(0)).current;
  const [paneIndex, setPaneIndex] = useState<0 | 1 | 2 | 3>(0);
  const headingAnim = useRef(new Animated.Value(0)).current;

  // header typing
  const introText = 'Let’s get you started.';
  const otpIntroText = 'Please enter the 6-digit OTP we sent.';
  const [typedIntro, setTypedIntro] = useState('');
  const typingRef = useRef<number | null>(null);

  // success animations (dots + progress)
  const successDotsRef = useRef<number | null>(null);
  const successProgress = useRef(new Animated.Value(0)).current;

  const successEntrance = useRef(new Animated.Value(0)).current;

  // layout constants
  const HORIZONTAL_PADDING = Math.round(scale(Layout.HORIZONTAL_PADDING));
  const CARD_MAX_WIDTH = Layout.CARD_MAX_WIDTH;
  const cardWidth = Math.min(width - HORIZONTAL_PADDING * 2, CARD_MAX_WIDTH);
  const centerMargin = Math.round((width - cardWidth) / 2);
  const CARD_RADIUS = Math.round(scale(Layout.CARD_RADIUS));
  const CARD_BOTTOM_MARGIN = Math.round(verticalScale(Layout.CARD_BOTTOM_MARGIN));
  const APPROX_HEADER_SPACE = Math.round(verticalScale(Layout.APPROX_HEADER_SPACE));
  const cardHeight = Math.max(
    Layout.MIN_CARD_HEIGHT,
    height - APPROX_HEADER_SPACE - CARD_BOTTOM_MARGIN,
  );

  // OTP layout
  const OTP_LENGTH = 6;
  const OTP_BOX_GAP = Math.round(scale(10));
  const OTP_CARD_HORIZONTAL_PADDING = Math.round(scale(22));
  const otpBoxSize = Math.floor(
    (cardWidth - OTP_CARD_HORIZONTAL_PADDING * 2 - (OTP_LENGTH - 1) * OTP_BOX_GAP) / OTP_LENGTH,
  );
  const otpBoxWidth = Math.max(Math.round(scale(36)), Math.min(Math.round(scale(56)), otpBoxSize));

  // translate for 4 panels
  const rowTranslateX = anim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, -width, -2 * width, -3 * width],
  });

  const mobileOpacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.85, 0.95] });
  const emailOpacity = anim.interpolate({
    inputRange: [0, 1, 1.5, 2],
    outputRange: [0.95, 1, 0.95, 1],
  });
  const otpOpacity = anim.interpolate({
    inputRange: [1, 1.5, 2, 2.5, 3],
    outputRange: [0.95, 0.98, 1, 0.98, 1],
  });

  const slideTo = (to: 0 | 1 | 2 | 3) => {
    Animated.timing(anim, {
      toValue: to,
      duration: Animation.SLIDE_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setPaneIndex(to));
  };

  useEffect(() => {
    Animated.timing(headingAnim, {
      toValue: paneIndex === 2 || paneIndex === 3 ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    if (typingRef.current) {
      clearInterval(typingRef.current as unknown as number);
      typingRef.current = null;
    }
    setTypedIntro('');

    const toType = paneIndex === 2 ? otpIntroText : introText;
    let i = 0;
    typingRef.current = setInterval(() => {
      i += 1;
      setTypedIntro(toType.slice(0, i));
      if (i >= toType.length) {
        clearInterval(typingRef.current as unknown as number);
        typingRef.current = null;
      }
    }, 28) as unknown as number;

    return () => {
      if (typingRef.current) {
        clearInterval(typingRef.current as unknown as number);
        typingRef.current = null;
      }
    };
  }, [paneIndex, headingAnim]);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (typingRef.current) {
        clearInterval(typingRef.current as unknown as number);
        typingRef.current = null;
      }
      if (successDotsRef.current) {
        clearInterval(successDotsRef.current as unknown as number);
        successDotsRef.current = null;
      }
      successProgress.stopAnimation();
    };
  }, []);

  useEffect(() => {
    let t: number | null = null;
    if (paneIndex === 2) {
      t = setTimeout(
        () => otpRef.current?.focus(0),
        Animation.SLIDE_DURATION_MS + 40,
      ) as unknown as number;
    }
    return () => {
      if (t) clearTimeout(t as unknown as number);
    };
  }, [paneIndex]);

  useEffect(() => {
    successProgress.setValue(0);
    successEntrance.setValue(0);

    if (paneIndex === 3) {
      Animated.timing(successProgress, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      
      Animated.sequence([
        Animated.delay(Animation.SLIDE_DURATION_MS * 0.5), 
        Animated.timing(successEntrance, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      if (successDotsRef.current) {
        clearInterval(successDotsRef.current as unknown as number);
        successDotsRef.current = null;
      }
      successProgress.stopAnimation();
      successEntrance.stopAnimation();
    }

    return () => {
      if (successDotsRef.current) {
        clearInterval(successDotsRef.current as unknown as number);
        successDotsRef.current = null;
      }
      successProgress.stopAnimation();
      successEntrance.stopAnimation();
    };
  }, [paneIndex, successProgress, successEntrance]);

  useEffect(() => {
    let navTimer: number | null = null;

    if (paneIndex === 3) {
      navTimer = setTimeout(async () => {
        if (!mountedRef.current) return;

        if (pendingTokens) {
          try {
            await auth.signIn(pendingTokens.accessToken, pendingTokens.refreshToken);
          } catch (err) {
            console.warn('auth.signIn failed after success animation', err);
            navigation.navigate('Home');
          } finally {
            setPendingTokens(null);
          }
        } else {
          navigation.navigate('Home');
        }
      }, 2000) as unknown as number;
    }

    return () => {
      if (navTimer) clearTimeout(navTimer as unknown as number);
    };
  }, [paneIndex, navigation, pendingTokens, auth]);

  const maskForDisplay = (value: string) => {
    if (!value) return '';
    if (/^[0-9]+$/.test(value)) {
      if (value.length >= 10) return `${value.slice(0, 5)} ${value.slice(5, 10)}`;
      return value;
    }
    const [name, domain] = value.split('@');
    if (!domain) return value;
    return `${name.slice(0, 2)}****@${domain}`;
  };

  const handleRegister = useCallback(
    async (identifier: string, type: 'mobile' | 'email') => {
      if (!identifier) return;
      if (type === 'mobile' && !canContinueMobile) return;
      if (type === 'email' && !canContinueEmail) return;

      if (type === 'mobile') setLoadingMobile(true);
      else setLoadingEmail(true);

      Keyboard.dismiss();
      try {
        const res = await Register(identifier);
        if (res?.code === 200) {
          setRawIdentifier(identifier);
          setOtpSendingTo(maskForDisplay(identifier));
          setOtp('');
          slideTo(2);
        } else {
          toast.error(res?.message || 'Failed to send OTP. Please try again.');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(msg || 'Failed to send OTP. Please try again.');
      } finally {
        if (mountedRef.current) {
          setLoadingMobile(false);
          setLoadingEmail(false);
        }
      }
    },
    [canContinueEmail, canContinueMobile],
  );

  const onContinueMobile = () => handleRegister(mobile, 'mobile');
  const onContinueEmail = () => handleRegister(email, 'email');

  const onVerifyOtp = useCallback(
    async (code?: unknown) => {
      if (code && typeof code === 'object') {
        code = undefined;
      }
      const otpValue = typeof code === 'string' ? code : String(otp ?? '');
      if ((otpValue ?? '').length < OTP_LENGTH) {
        toast.error(`Please enter the ${OTP_LENGTH}-digit OTP.`);
        return;
      }

      setOtpLoading(true);
      try {
        const identifier = rawIdentifier ?? otpSendingTo ?? mobile ?? email ?? '';
        const id = typeof identifier === 'string' ? identifier : String(identifier);

        const res = await VerifyOtp(id, otpValue);

        if (res?.code === 200 && res.data && typeof res.data === 'object' && 'tokens' in res.data) {
          const tokens = (res.data as { tokens?: { accessToken?: string; refreshToken?: string } }).tokens ?? {};
          const accessToken = tokens.accessToken ?? '';
          const refreshToken = tokens.refreshToken ?? '';
          setPendingTokens({ accessToken, refreshToken });

          slideTo(3);
          toast.success('Verified successfully.');
        } else {
          toast.error(res?.message || 'Invalid OTP. Please try again.');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(msg || 'Unable to verify OTP. Please try again.');
      } finally {
        if (mountedRef.current) setOtpLoading(false);
      }
    },
    [otp, otpSendingTo, mobile, email, rawIdentifier],
  );

  const onOtpComplete = async (val: string) => {
    setOtp(val);
    onVerifyOtp(val);
  };

  const onResendOtp = async () => {
    if (!otpSendingTo) {
      toast.error('No identifier to resend OTP to.');
      return;
    }
    setResendLoading(true);
    try {
      toast.success('OTP resent (placeholder).');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || 'Unable to resend OTP.');
    } finally {
      if (mountedRef.current) setResendLoading(false);
    }
  };

  const headingScale = headingAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] });
  const headingTranslateY = headingAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const headingOpacity = headingAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] });

  return (
    <Background>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{ flex: 1 }}>
            {paneIndex !== 3 && (
              <View style={[styles.headerWrap, { paddingTop: verticalScale(55) }]}>
                <Animated.Text
                  style={[
                    styles.title,
                    {
                      fontSize: moderateScale(22),
                      transform: [{ scale: headingScale }, { translateY: headingTranslateY }],
                      opacity: headingOpacity,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {paneIndex === 2 ? 'You are almost there' : 'LOGIN / REGISTER'}
                </Animated.Text>

                <Text style={[styles.subtitle, { fontSize: moderateScale(14) }]}>{typedIntro}</Text>
              </View>
            )}

            <View style={[styles.cardWrapper, { marginBottom: Math.round(CARD_BOTTOM_MARGIN) }]}>
              <Animated.View
                style={{
                  width: width * 4,
                  flexDirection: 'row',
                  transform: [{ translateX: rowTranslateX }],
                }}
              >
                {/* Panel 0 - Mobile */}
                <View style={{ width }}>
                  <Animated.View
                    style={[
                      styles.card,
                      {
                        width: cardWidth,
                        height: cardHeight,
                        borderRadius: CARD_RADIUS,
                        padding: Math.round(scale(20)),
                        marginLeft: centerMargin,
                        marginRight: centerMargin,
                        opacity: mobileOpacity,
                      },
                    ]}
                  >
                    <View>
                      <TextInput
                        value={mobile}
                        onChangeText={(t) => setMobile(t.replace(/[^0-9]/g, '').slice(0, 10))}
                        keyboardType="phone-pad"
                        maxLength={Validation.MOBILE_LENGTH}
                        placeholder={Placeholders.MOBILE}
                        placeholderTextColor={Colors.placeholder}
                        style={[
                          styles.input,
                          {
                            paddingVertical:
                              Platform.OS === 'ios' ? verticalScale(14) : verticalScale(10),
                            borderRadius: Math.round(scale(12)),
                          },
                        ]}
                      />

                      <TouchableOpacity
                        style={[styles.checkboxRow, { marginVertical: verticalScale(14) }]}
                        activeOpacity={0.75}
                        onPress={() => setIsAdultMobile((v) => !v)}
                      >
                        <CircleCheckbox checked={isAdultMobile} />
                        <Text style={[styles.checkboxLabel, { fontSize: moderateScale(14) }]}>
                          I am above 18 years
                        </Text>
                      </TouchableOpacity>

                      {loadingMobile ? (
                        <View
                          style={[
                            styles.loadingView,
                            {
                              paddingVertical: verticalScale(12),
                              borderRadius: Math.round(scale(22)),
                            },
                          ]}
                        >
                          <ActivityIndicator size="small" color="#FFF" />
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.cta,
                            {
                              backgroundColor: canContinueMobile
                                ? Colors.primary
                                : Colors.grayLight,
                              borderRadius: Math.round(scale(22)),
                              paddingVertical: verticalScale(12),
                            },
                          ]}
                          disabled={!canContinueMobile}
                          onPress={onContinueMobile}
                        >
                          <Text
                            style={[
                              styles.ctaLabel,
                              {
                                color: canContinueMobile ? Colors.white : Colors.placeholder,
                                fontSize: moderateScale(16),
                              },
                            ]}
                          >
                            Continue
                          </Text>
                        </TouchableOpacity>
                      )}

                      <View style={[styles.orRow, { marginVertical: verticalScale(22) }]}>
                        <View style={styles.orLine} />
                        <View
                          style={[
                            styles.orCircle,
                            {
                              width: Math.round(scale(34)),
                              height: Math.round(scale(34)),
                              borderRadius: Math.round(scale(17)),
                            },
                          ]}
                        >
                          <Text style={[styles.orText, { fontSize: moderateScale(12) }]}>or</Text>
                        </View>
                        <View style={styles.orLine} />
                      </View>

                      <Text style={[styles.otherWrap, { fontSize: moderateScale(14) }]}>
                        <Text style={styles.otherPlain}>Login with </Text>
                        <Text
                          style={[styles.otherLink, { fontSize: moderateScale(14) }]}
                          onPress={() => slideTo(1)}
                        >
                          other options
                        </Text>
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.terms,
                        { marginTop: verticalScale(12), fontSize: moderateScale(12) },
                      ]}
                    >
                      Terms and conditions
                    </Text>
                  </Animated.View>
                </View>

                {/* Panel 1 - Email */}
                <View style={{ width }}>
                  <Animated.View
                    style={[
                      styles.card,
                      {
                        width: cardWidth,
                        height: cardHeight,
                        borderRadius: CARD_RADIUS,
                        padding: Math.round(scale(20)),
                        marginLeft: centerMargin,
                        marginRight: centerMargin,
                        opacity: emailOpacity,
                      },
                    ]}
                  >
                    <View>
                      <TextInput
                        value={email}
                        onChangeText={(t) => setEmail(t)}
                        keyboardType="email-address"
                        placeholder={Placeholders.EMAIL}
                        placeholderTextColor={Colors.placeholder}
                        autoCapitalize="none"
                        style={[
                          styles.input,
                          {
                            paddingVertical:
                              Platform.OS === 'ios' ? verticalScale(14) : verticalScale(10),
                            borderRadius: Math.round(scale(12)),
                          },
                        ]}
                      />

                      <TouchableOpacity
                        style={[styles.checkboxRow, { marginVertical: verticalScale(14) }]}
                        activeOpacity={0.75}
                        onPress={() => setIsAdultEmail((v) => !v)}
                      >
                        <CircleCheckbox checked={isAdultEmail} />
                        <Text style={[styles.checkboxLabel, { fontSize: moderateScale(14) }]}>
                          I am above 18 years
                        </Text>
                      </TouchableOpacity>

                      {loadingEmail ? (
                        <View
                          style={[
                            styles.loadingView,
                            {
                              paddingVertical: verticalScale(12),
                              borderRadius: Math.round(scale(22)),
                            },
                          ]}
                        >
                          <ActivityIndicator size="small" color="#FFF" />
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.cta,
                            {
                              backgroundColor: canContinueEmail ? Colors.primary : Colors.grayLight,
                              borderRadius: Math.round(scale(22)),
                              paddingVertical: verticalScale(12),
                            },
                          ]}
                          disabled={!canContinueEmail}
                          onPress={onContinueEmail}
                        >
                          <Text
                            style={[
                              styles.ctaLabel,
                              {
                                color: canContinueEmail ? Colors.white : Colors.placeholder,
                                fontSize: moderateScale(16),
                              },
                            ]}
                          >
                            Continue
                          </Text>
                        </TouchableOpacity>
                      )}

                      <View style={[styles.orRow, { marginVertical: verticalScale(22) }]}>
                        <View style={styles.orLine} />
                        <View
                          style={[
                            styles.orCircle,
                            {
                              width: Math.round(scale(34)),
                              height: Math.round(scale(34)),
                              borderRadius: Math.round(scale(17)),
                            },
                          ]}
                        >
                          <Text style={[styles.orText, { fontSize: moderateScale(12) }]}>or</Text>
                        </View>
                        <View style={styles.orLine} />
                      </View>

                      <Text style={[styles.otherWrap, { fontSize: moderateScale(14) }]}>
                        <Text style={styles.otherPlain}>Back to </Text>
                        <Text
                          style={[styles.otherLink, { fontSize: moderateScale(14) }]}
                          onPress={() => slideTo(0)}
                        >
                          mobile login
                        </Text>
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.terms,
                        { marginTop: verticalScale(12), fontSize: moderateScale(12) },
                      ]}
                    >
                      Terms and conditions
                    </Text>
                  </Animated.View>
                </View>

                {/* Panel 2 - OTP */}
                <View style={{ width }}>
                  <Animated.View
                    style={[
                      styles.card,
                      {
                        width: cardWidth,
                        height: cardHeight,
                        borderRadius: CARD_RADIUS,
                        padding: Math.round(scale(20)),
                        marginLeft: centerMargin,
                        marginRight: centerMargin,
                        opacity: otpOpacity,
                      },
                    ]}
                  >
                    <View>
                      <View style={{ marginTop: verticalScale(18), alignItems: 'center' }}>
                        <Text style={{ color: Colors.mutedText }}>
                          Please enter the OTP sent on
                        </Text>
                        <Text
                          style={{ marginTop: 6, fontWeight: '700', fontSize: moderateScale(16) }}
                        >
                          {otpSendingTo ?? maskForDisplay(mobile)}
                        </Text>

                        <View
                          style={{
                            marginTop: verticalScale(20),
                            alignItems: 'center',
                            paddingHorizontal: Math.round(scale(6)),
                          }}
                        >
                          <OtpInput
                            ref={otpRef}
                            length={OTP_LENGTH}
                            value={otp}
                            autoFocus={false}
                            onChange={(val) => setOtp(val)}
                            onComplete={onOtpComplete}
                            boxStyle={{
                              width: otpBoxWidth,
                              height: Math.round(otpBoxWidth * 1.05),
                              borderRadius: Math.round(scale(8)),
                              backgroundColor: Colors.grayLight,
                              marginHorizontal: Math.round(OTP_BOX_GAP / 2),
                            }}
                            textStyle={{
                              fontSize: Math.round(otpBoxWidth * 0.42),
                              textAlign: 'center',
                            }}
                          />
                        </View>

                        <View style={{ marginTop: verticalScale(18), width: '100%' }}>
                          {otpLoading ? (
                            <View
                              style={[
                                styles.loadingView,
                                {
                                  paddingVertical: verticalScale(12),
                                  borderRadius: Math.round(scale(22)),
                                },
                              ]}
                            >
                              <ActivityIndicator size="small" color="#FFF" />
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={[
                                styles.cta,
                                {
                                  backgroundColor: Colors.primary,
                                  borderRadius: Math.round(scale(22)),
                                  paddingVertical: verticalScale(12),
                                },
                              ]}
                              onPress={onVerifyOtp}
                            >
                              <Text
                                style={[
                                  styles.ctaLabel,
                                  { color: Colors.white, fontSize: moderateScale(16) },
                                ]}
                              >
                                Verify
                              </Text>
                            </TouchableOpacity>
                          )}

                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginTop: verticalScale(12),
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => {
                                setRawIdentifier(null);
                                setOtpSendingTo(null);
                                setOtp('');
                                slideTo(0);
                              }}
                            >
                              <Text style={{ color: Colors.grayDark }}>Change mobile/email</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onResendOtp} disabled={resendLoading}>
                              <Text style={{ color: Colors.primary }}>
                                {resendLoading ? 'Resending...' : 'Resend OTP'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.terms,
                        { marginTop: verticalScale(12), fontSize: moderateScale(12) },
                      ]}
                    >
                      Terms and conditions
                    </Text>
                  </Animated.View>
                </View>

                {/* Panel 3 - Success */}
                <View style={{ width }}>
                  <Animated.View
                    style={[
                      styles.card,
                      {
                        width: cardWidth,
                        height: cardHeight,
                        borderRadius: CARD_RADIUS,
                        marginTop: 80,
                        padding: Math.round(scale(20)),
                        marginLeft: centerMargin,
                        marginRight: centerMargin,
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                    ]}
                  >
                    <Animated.View
                      style={{
                        alignItems: 'center',
                        opacity: successEntrance, // fade in
                        transform: [
                          {
                            scale: successEntrance.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.96, 1],
                            }),
                          },
                        ],
                      }}
                    >
                      <View
                        style={{
                          width: Math.round(scale(96)),
                          height: Math.round(scale(96)),
                          borderRadius: Math.round(scale(48)),
                          backgroundColor: Colors.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: verticalScale(18),
                          // keep design identical
                        }}
                      >
                        <Text
                          style={{
                            color: Colors.white,
                            fontSize: moderateScale(36),
                            fontWeight: '800',
                          }}
                        >
                          ✓
                        </Text>
                      </View>

                      <Text
                        style={{
                          fontSize: moderateScale(20),
                          fontWeight: '800',
                          marginBottom: verticalScale(8),
                        }}
                      >
                        You have successfully logged in
                      </Text>

                      <View
                        style={{ marginTop: verticalScale(6), alignItems: 'center', width: '100%' }}
                      >
                        <Text
                          style={{
                            color: Colors.mutedText,
                            textAlign: 'center',
                            paddingHorizontal: Math.round(scale(10)),
                          }}
                        >
                          Taking you to the home screen
                        </Text>

                        {/* progress bar */}
                        <View
                          style={{
                            marginTop: verticalScale(12),
                            width: Math.round(cardWidth * 0.6),
                            height: Math.max(4, Math.round(verticalScale(6))),
                            borderRadius: 999,
                            backgroundColor: Colors.grayLight,
                            overflow: 'hidden',
                            alignSelf: 'center',
                          }}
                        >
                          <Animated.View
                            style={{
                              height: '100%',
                              width: '100%',
                              transform: [{ scaleX: successProgress }],
                              alignSelf: 'flex-start',
                              borderRadius: 999,
                              backgroundColor: Colors.primary,
                            }}
                          />
                        </View>
                      </View>
                    </Animated.View>
                  </Animated.View>
                </View>
              </Animated.View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Background>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: Math.round(scale(20)),
    marginBottom: verticalScale ? verticalScale(8) : 8,
  },
  title: {
    fontWeight: '800',
    color: Colors.white,
  },
  subtitle: {
    color: Colors.white,
    marginTop: 6,
  },
  cardWrapper: {
    flex: 1,
    marginTop: 40,
  },
  card: {
    backgroundColor: Colors.white,
    paddingBottom: Math.round(verticalScale(20)),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    justifyContent: 'space-between',
  },
  input: {
    backgroundColor: Colors.grayLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.black,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 10,
    color: '#222',
  },
  cta: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontWeight: '700',
  },
  loadingView: {
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.grayMedium,
  },
  orCircle: {
    backgroundColor: Colors.white,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  orText: {
    color: Colors.mutedText,
  },
  otherWrap: {
    textAlign: 'center',
  },
  otherPlain: {
    color: Colors.grayDark,
  },
  otherLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
  terms: {
    textAlign: 'center',
    color: Colors.mutedText,
  },
});
