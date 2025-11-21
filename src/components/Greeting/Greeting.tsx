import React from 'react';
import { View, Text } from 'react-native';
import type { GreetingProps } from './GreetingTypes';

export const Greeting: React.FC<GreetingProps> = ({ username }) => {
  return (
    <View className="items-center justify-center">
      <Text className="text-xl font-semibold text-gray-800">
        Hello, {username}!
      </Text>
    </View>
  );
};
