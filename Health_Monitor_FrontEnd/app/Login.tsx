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
      // handle error (e.g., show error message)
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
    backgroundColor: "#f5f5f5",
  },
  form: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#f9f9f9",
  },
  button: {
    marginTop: 10,
    padding: 15,
    backgroundColor: "#007BFF",
    borderRadius: 4,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "#007BFF",
    textAlign: "center",
    textDecorationLine: "underline",
    fontSize: 14,
    fontWeight: "400",
  },
});

export default Login;
