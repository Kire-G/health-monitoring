import React, { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppContext } from "@/context/AppContext";
import axiosInstance, { AUTH, USER } from "@/config/axiosConfig";
const Login = () => {
  const navigation = useNavigation<any>();
  const [loginInfo, setLoginInfo] = useState({ email: "", password: "" });
  const { user, setUser } = useAppContext();

  const handleInputChange = (field: string, value: string) => {
    setLoginInfo({
      ...(field === "email"
        ? { email: value, password: loginInfo.password }
        : { email: loginInfo.email, password: value }),
    });
  };

  const handleSubmit = async () => {
    try {
      // Authenticate and obtain JWT token
      const { data } = await axiosInstance.post(`${AUTH}/login`, {
        email: loginInfo.email,
        password: loginInfo.password,
      });

      if (data?.token) {
        await AsyncStorage.setItem("auth_token", data.token);
        await AsyncStorage.setItem("user_email", loginInfo.email);
        
        // Fetch user profile data using email
        try {
          const userResponse = await axiosInstance.get(`${USER}/?email=${loginInfo.email}&password=${loginInfo.password}`);
          if (userResponse.data) {
            setUser(userResponse.data);
          }
        } catch (userError) {
          console.error("Failed to fetch user profile:", userError);
        }
        
        navigation.navigate("MainTabs");
      } else {
        Alert.alert("Login Failed", "Invalid response from server.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert("Login Failed", "Invalid email or password.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Login</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={loginInfo.email}
            onChangeText={handleInputChange.bind(null, "email")}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={loginInfo.password}
            onChangeText={handleInputChange.bind(null, "password")}
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>
        <View>
          <TouchableOpacity
            style={{ margin: 10 }}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.link}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Login</Text>
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

export default Login;
