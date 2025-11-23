import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
export const SCREEN_HEIGHT = height;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.18,
    justifyContent: 'flex-start',
  },

  heading: {
    fontSize: Math.round(Math.min(width, height) * 0.12),
    lineHeight: Math.round(Math.min(width, height) * 0.11),
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '700',
  },

  subheading: {
    fontSize: Math.round(Math.min(width, height) * 0.035),
    lineHeight: Math.round(Math.min(width, height) * 0.04),
    color: 'rgba(255,255,255,0.95)',
  },

  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height,
    backgroundColor: '#ffffff',
    zIndex: 60,
  },

  absoluteFillBottom: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 50,
  },

  swipeWrapper: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 0,
    right: 0,
    zIndex: 70,
  },

  card: {
    width: '92%',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    alignItems: 'center',
  },

  chevronRow: {
    alignItems: 'center',
    marginBottom: 8,
  },

  chevron: {
    fontSize: 18,
    lineHeight: 20,
    color: '#8b0f0f',
  },

  helper: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
    color: '#222',
  },

  label: {
    fontSize: 16,
    marginTop: 6,
    fontWeight: '800',
    color: '#7a0000',
    letterSpacing: 0.8,
  },
});

export const GLOBAL = {
  SCREEN_HEIGHT,
  background: styles.background,
  overlay: styles.overlay,
  absoluteFillBottom: styles.absoluteFillBottom,
  swipeWrapper: styles.swipeWrapper,
  card: styles.card,
  chevronRow: styles.chevronRow,
  chevron: styles.chevron,
  helper: styles.helper,
  label: styles.label,

};

export default GLOBAL;