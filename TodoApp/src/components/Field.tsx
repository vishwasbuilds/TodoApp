// Reusable labeled text input that keeps form fields visually consistent.
import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { styles } from '../theme';

type FieldProps = TextInputProps & { label: string };

export default function Field({ label, ...inputProps }: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        style={[styles.input, inputProps.multiline && styles.multiline]}
        placeholderTextColor="#A0A7B8"
      />
    </View>
  );
}
