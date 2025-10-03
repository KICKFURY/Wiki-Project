import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { ThemedText } from '../../../components/themed-text';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  required = false,
  icon,
  style,
  ...textInputProps
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <ThemedText style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </ThemedText>
        </View>
      )}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor="#999"
        {...textInputProps}
      />
      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
});
