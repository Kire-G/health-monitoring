
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
    },
    form: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        marginBottom: 5,
        fontSize: 16,
        color: '#333',
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        backgroundColor: '#f9f9f9',
    },
    button: {
        marginTop: 10,
        padding: 15,
        backgroundColor: '#007BFF',
        borderRadius: 4,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    
    link: {
        color: '#007BFF',
        textAlign: 'center',
        textDecorationLine: 'underline',
        fontSize: 14,
        fontWeight: '400',
    },
});
