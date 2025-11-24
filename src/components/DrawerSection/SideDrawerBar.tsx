// src/components/SideDrawerBar.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ImageSourcePropType,
  GestureResponderEvent,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';

import SvgPencil from '../../assets/svg/Pencil';
import SvgWallet from '../../assets/svg/Wallet';
import SvgAccount from '../../assets/svg/Account';
import SvgMore from '../../assets/svg/More';
import SvgReward from '../../assets/svg/Reward';
import SvgOffer from '../../assets/svg/Offer';
import SvgGift from '../../assets/svg/Gifts';
import SvgHelp from '../../assets/svg/HelpCenter';

import { getAccessToken } from '../../services/tokenService';
import { GetProfile } from '../../services/AuthService';
import { ApiResponseWithUser } from '../../types/types';
import { useAuth } from '../../auth/AuthProvider';
import { DrawerProps, MenuRowProps } from '../../navigation/types';

const DEFAULT_DRAWER_BG = '/mnt/data/15cb5ec5-ba8c-4e0f-afbd-2b5439a9fbb6.png';
const FALLBACK_AVATAR = require('../../assets/profile.png');



const MenuRow = React.memo(function MenuRow({
  icon,
  label,
  onPress,
  disabled,
  testID,
  active = false,
}: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{ color: '#F4F4F4' }}
      hitSlop={8}
      style={[styles.row, active && styles.rowActive]}
    >
      <View style={[styles.iconWrapper, active && styles.iconWrapperActive]}>
        {icon ?? <View style={styles.iconPlaceholder} />}
      </View>
      <Text
        style={[
          styles.rowText,
          active && styles.rowTextActive,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </Pressable>
  );
});

MenuRow.displayName = 'MenuRow';

function SubMenuRow({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: '#F4F4F4' }}
      hitSlop={8}
      style={styles.subRow}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={{ width: 36 }} />
      <Text style={styles.subRowText}>{label}</Text>
    </Pressable>
  );
}

export default function SideDrawerBar(props: DrawerProps) {
  const auth = useAuth();
  const { navigation, backgroundImage, avatarUri: avatarProp } = props;
  const [avatarUri, setAvatarUri] = useState<string | null>(avatarProp ?? null);
  const [firstName, setFirstName] = useState<string>('');
  const [accountExpanded, setAccountExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const bgSource = useMemo<ImageSourcePropType>(() => {
    if (!backgroundImage) return { uri: DEFAULT_DRAWER_BG };
    if (typeof backgroundImage === 'string') return { uri: backgroundImage };
    return backgroundImage as ImageSourcePropType;
  }, [backgroundImage]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const res = (await GetProfile()) as ApiResponseWithUser;
        if (!mounted) return;
        if (res?.code === 200) {
          const user = res.data?.user ?? {};
          setFirstName(user.firstName ?? '');
          setAvatarUri(user.profilePicture ?? null);
        }
      } catch {
        // silent
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const navigateAndClose = useCallback(
    (route?: string) => () => {
      if (!route) return;
      navigation.closeDrawer();
      setTimeout(() => navigation.navigate(route as never), 160);
    },
    [navigation]
  );

  const toggleAccount = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAccountExpanded((v) => !v);
  }, []);

  const handleKyc = useCallback(() => {
    navigation.closeDrawer();
    setTimeout(() => navigation.navigate('KYCPage' as never), 160);
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.warn('signOut failed', err);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={bgSource} style={styles.headerBg} resizeMode="cover" />

      <View style={styles.headerOverlay}>
        <View style={styles.headerInner}>
          <View style={styles.leftGroup}>
            {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatar} /> : <Image source={FALLBACK_AVATAR} style={styles.avatar} />}

            <View style={styles.nameBlock}>
              <Text style={styles.helloText}>Hello</Text>
              <Text style={styles.nameText}>{firstName || 'Darling'}</Text>
            </View>
          </View>

          <Pressable
            style={styles.editFabRight}
            onPress={navigateAndClose('Profile')}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            hitSlop={8}
          >
            <View style={styles.iconCenterWrapper}>
              <SvgPencil width={10} height={10} />
            </View>
          </Pressable>
        </View>
      </View>

      <DrawerContentScrollView contentContainerStyle={styles.menuContainer}>
        <View style={styles.card}>
          <MenuRow icon={<SvgWallet width={20} height={20} />} label="Wallet" onPress={() => {}} />
          <MenuRow
            icon={<SvgAccount width={20} height={20} />}
            label="Account & Settings"
            onPress={toggleAccount}
            active={accountExpanded}
          />
          {accountExpanded && (
            <View style={styles.subMenuWrap}>
              <SubMenuRow label="KYC Verify" onPress={handleKyc} />
            </View>
          )}
          <MenuRow icon={<SvgMore width={20} height={20} />} label="More" onPress={() => {}} />
        </View>

        <View style={[styles.card, styles.cardSpacing]}>
          <MenuRow icon={<SvgReward width={20} height={20} />} label="Rewards" onPress={() => {}} />
          <MenuRow icon={<SvgOffer width={20} height={20} />} label="Offers" onPress={() => {}} />
          <MenuRow icon={<SvgGift width={20} height={20} />} label="Gifts" onPress={() => {}} />
        </View>

        <View style={[styles.card, styles.cardSpacing]}>
          <MenuRow icon={<SvgHelp width={20} height={20} />} label="Help centre" onPress={() => {}} />
        </View>

        <View style={[styles.card, styles.cardSpacing]}>
          <MenuRow icon={<SvgAccount width={20} height={20} />} label="Sign Out" onPress={handleLogout} />
        </View>

        <View style={styles.bottomSpacer} />
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  headerBg: {
    width: '100%',
    height: 170,
    borderBottomRightRadius: 36,
  },

  headerOverlay: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 170,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 78,
    height: 78,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },

  nameBlock: { marginLeft: 12, marginBottom: 6 },

  helloText: { color: '#fff', fontSize: 12, opacity: 0.95 },

  nameText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 2,
  },

  editFabRight: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#D5003C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconCenterWrapper: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },

  menuContainer: { paddingHorizontal: 16, paddingBottom: 24, marginTop: -50 },

  card: {
    backgroundColor: '#FBFBFB',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },

  cardSpacing: { marginTop: 10 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },

  rowActive: {
    backgroundColor: '#F6EDEE',
    borderRadius: 8,
  },

  iconWrapper: {
    width: 36,
    height: 36,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  iconWrapperActive: {
    backgroundColor: '#FFE8EA',
    borderRadius: 8,
  },

  iconPlaceholder: { width: 18, height: 18, borderRadius: 4, backgroundColor: '#ddd' },

  rowText: { flex: 1, flexShrink: 1, fontSize: 14, color: '#484848' },

  rowTextActive: {
    color: '#D5003C',
    fontWeight: '700',
  },

  bottomSpacer: { height: 40 },

  /* submenu styles */
  subMenuWrap: { paddingLeft: 8, backgroundColor: 'transparent' },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  subRowText: { fontSize: 14, color: '#484848', marginLeft: 8 },
});
