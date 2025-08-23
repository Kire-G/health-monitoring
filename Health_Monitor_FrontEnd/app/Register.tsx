
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import User from '../constants/User';
import { API_BASE_URL } from '../api';


export default function Register ({ navigation }: { navigation: any }) {
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formData, setFormData] = useState<User>({
        name: '',
        email: '',
        password: '',
        age: undefined,
        online: true,
    });

    const handleChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleRegister = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.name?.trim()) {
            Alert.alert('Missing name', 'Please enter your name.');
            return;
        }
        if (!formData.email || !emailRegex.test(formData.email)) {
            Alert.alert('Invalid email', 'Please enter a valid email address.');
            return;
        }
        if (formData.age == null || isNaN(Number(formData.age)) || Number(formData.age) <= 0 || Number(formData.age) > 120) {
            Alert.alert('Invalid age', 'Please enter a valid age between 1 and 120.');
            return;
        }
        if (!formData.password || formData.password.length < 6) {
            Alert.alert('Weak password', 'Password should be at least 6 characters long.');
            return;
        }
        if (confirmPassword !== formData.password) {
            Alert.alert('Password mismatch', 'Passwords do not match.');
            return;
        }

        // Persist to backend
        try {
            const resp = await fetch(`${API_BASE_URL}/user/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    age: Number(formData.age),
                    email: formData.email,
                    password: formData.password,
                }),
            });
            if (!resp.ok) {
                const text = await resp.text().catch(() => '');
                throw new Error(text || `Request failed with status ${resp.status}`);
            }
            Alert.alert('Success', 'Registration successful. Please login.', [
                { text: 'OK', onPress: () => navigation.navigate('Login') },
            ]);
        } catch (e: any) {
            Alert.alert('Registration failed', e?.message || 'Unable to register. Please try again.');
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.title}>Register</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(value) => handleChange('name', value)}
                        placeholder="Enter your name"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(value) => handleChange('email', value)}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Age</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.age != null ? String(formData.age) : ''}
                        onChangeText={(value) => {
                          const numeric = Number(value.replace(/[^0-9]/g, ''));
                          setFormData({ ...formData, age: isNaN(numeric) ? undefined : numeric });
                        }}
                        placeholder="Enter your age"
                        keyboardType="numeric"
                        inputMode="numeric"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.password}
                        onChangeText={(value) => handleChange('password', value)}
                        placeholder="Enter your password"
                        secureTextEntry
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={(value) => setConfirmPassword(value)}
                        placeholder="Confirm your password"
                        secureTextEntry
                    />
                </View>
                <View>
                    <View>
                        <TouchableOpacity style={{ margin: 10 }} onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.link}>Already have an account? Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    color: "#ccc",
  },
  input: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    backgroundColor: "#2E2E2E",
    color: "#FFFFFF",
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#ff0051",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "#ff0051",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});
