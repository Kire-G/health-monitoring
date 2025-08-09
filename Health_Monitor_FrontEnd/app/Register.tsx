
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import User from '../constants/User';


export default function Register ({ navigation }: { navigation: any }) {
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formData, setFormData] = useState<User>({
        name: '',
        email: '',
        password: '',
        phoneNumber: '', 
        online: true,
    });

    const handleChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
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
                    <Text style={styles.label}>Phone</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.phoneNumber}
                        onChangeText={(value) => handleChange('phoneNumber', value)}
                        placeholder="Enter your phone number"
                        keyboardType="phone-pad"
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
                <TouchableOpacity style={styles.button} >
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
