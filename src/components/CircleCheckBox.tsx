import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/constants';

interface Props {
  checked: boolean;
  onToggle?: () => void;
  size?: number;
}

export default function CircleCheckbox({ checked, onToggle, size = 24 }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onToggle}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: checked ? Colors.primary : '#BEBEBE',
            backgroundColor: checked ? Colors.primary : '#fff',
          },
        ]}
      >
        {checked && <Text style={styles.tick}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tick: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    marginTop: -2, 
  },
});
