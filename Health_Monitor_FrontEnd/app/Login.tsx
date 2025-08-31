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
import axios from "axios";
import { useAppContext } from "@/context/AppContext";
import { USER } from "@/config/axiosConfig";
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
      const response = await axios.get(`${USER}/`, {
        params: { email: loginInfo.email, password: loginInfo.password },
      });

      if (response.data) {
        setUser(response.data);
        navigation.navigate("MainTabs");
      } else {
        Alert.alert("Login Failed", "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login failed:", error);
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
