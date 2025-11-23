import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Platform,
} from 'react-native';

type Props = {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
  containerStyle?: ViewStyle;
  boxStyle?: ViewStyle;
  textStyle?: TextStyle;
  inputProps?: Partial<TextInputProps>;
  testIDPrefix?: string;
  onComplete?: (value: string) => void;
};

export type OtpInputRef = {
  focus: (idx?: number) => void;
  clear: () => void;
  getValue: () => string;
};

const OtpInput = forwardRef<OtpInputRef, Props>((props, ref) => {
  const {
    length = 6,
    value: controlledValue,
    onChange,
    autoFocus = false,
    containerStyle,
    boxStyle,
    textStyle,
    inputProps,
    testIDPrefix = 'otp',
    onComplete,
  } = props;

  const [internal, setInternal] = useState<string>(() => (controlledValue ?? '').slice(0, length));

  useEffect(() => {
    if (typeof controlledValue === 'string') {
      setInternal(controlledValue.slice(0, length));
    }
  }, [controlledValue, length]);

  const inputsRef = useRef<Array<TextInput | null>>([]);
  if (inputsRef.current.length !== length) {
    inputsRef.current = Array.from({ length }).map((_, i) => inputsRef.current[i] ?? null);
  }

  useImperativeHandle(
    ref,
    () => ({
      focus: (idx = 0) => {
        const clamped = Math.max(0, Math.min(length - 1, idx));
        inputsRef.current[clamped]?.focus();
      },
      clear: () => {
        setInternal('');
        onChange?.('');
        inputsRef.current[0]?.focus();
      },
      getValue: () => internal,
    }),
    [internal, length, onChange],
  );

  const setValue = (next: string) => {
    const sanitized = next.replace(/[^0-9]/g, '').slice(0, length);
    setInternal(sanitized);
    onChange?.(sanitized);
    if (sanitized.length === length) onComplete?.(sanitized);
  };

  const handleChangeTextAt = (idx: number, text: string) => {
    if (!text) {
      setValue(internal.substring(0, idx));
      return;
    }

    const digitsOnly = text.replace(/[^0-9]/g, '');
    if (digitsOnly.length > 1) {
      const prefix = internal.substring(0, idx);
      const combined = (prefix + digitsOnly).slice(0, length);
      setValue(combined);
      const nextIdx = Math.min(length - 1, idx + digitsOnly.length);
      setTimeout(() => inputsRef.current[nextIdx]?.focus(), 20);
      return;
    }

    const nextArr = internal.split('');
    nextArr[idx] = digitsOnly;
    const newVal = nextArr.join('').slice(0, length);
    setValue(newVal);

    if (digitsOnly) {
      const nextIndex = Math.min(length - 1, idx + 1);
      if (idx < length - 1) inputsRef.current[nextIndex]?.focus();
      else inputsRef.current[idx]?.blur?.();
    }
  };

  const handleKeyPressAt = (
    idx: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    const { key } = e.nativeEvent;
    if (key === 'Backspace') {
      if ((internal[idx] ?? '') === '') {
        const prev = Math.max(0, idx - 1);
        const nextState = internal.substring(0, prev);
        setValue(nextState);
        setTimeout(() => inputsRef.current[prev]?.focus(), 0);
      } else {
        const arr = internal.split('');
        arr[idx] = '';
        setValue(arr.join(''));
        setTimeout(() => inputsRef.current[idx]?.focus(), 0);
      }
    }
  };

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputsRef.current[0]?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <View style={[styles.container, containerStyle]}>
      {Array.from({ length }).map((_, i) => {
        const digit = internal[i] ?? '';
        return (
          <TextInput
            key={`otp-${i}`}
            ref={(el) => {
              inputsRef.current[i] = el ?? null;
            }}
            value={digit}
            onChangeText={(t) => handleChangeTextAt(i, t)}
            onKeyPress={(e) => handleKeyPressAt(i, e)}
            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
            returnKeyType="done"
            maxLength={1}
            style={[styles.box, boxStyle, textStyle]}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            importantForAutofill="yes"
            selectionColor="transparent"
            caretHidden={false}
            {...inputProps}
            testID={`${testIDPrefix}-${i}`}
          />
        );
      })}
    </View>
  );
});

export default OtpInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  box: {
    marginHorizontal: 4, 
    borderRadius: 6,
    backgroundColor: '#f2f2f2',
    textAlign: 'center',
    fontSize: 18,
    color: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
