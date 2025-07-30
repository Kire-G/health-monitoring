import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppContext } from "@/context/AppContext";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { USER } from "@/config/axiosConfig";

const DetailItem = ({ icon, label, value }) => (
  <View style={styles.detailItem}>
    <Ionicons name={icon} size={24} color="#A9A9A9" style={styles.detailIcon} />
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);


const MenuItem = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#E0E0E0" />
    <Text style={styles.menuItemText}>{text}</Text>
    <Ionicons name="chevron-forward" size={22} color="#555" />
  </TouchableOpacity>
);

const Profile = () => {
  const { user, setUser, healthData } = useAppContext();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName] = useState(user?.name);
  const [email, setEmail] = useState(user?.email);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber);
  const [age, setAge] = useState(user?.age?.toString());
  const [gender, setGender] = useState(user?.gender);
  const [height, setHeight] = useState(user?.height?.toString());
  const [weight, setWeight] = useState(user?.weight?.toString());

  const handleLogout = () => {
    setUser(null);
    navigation.navigate("Login" as never);
  };


  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      const updatedDetails = {
        name,
        email,
        phoneNumber,
        age: age ? parseInt(age) : undefined,
        gender,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
      };
      const response = await axios.put(`${USER}/${user.id}`, updatedDetails);
      setUser(response.data);
      Alert.alert("Success", "Profile updated successfully!");
      setModalVisible(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const calculateBmi = () => {
    if (!user || !user.height || !user.weight) {
      return { bmi: null, category: "N/A", color: "#A9A9A9" };
    }
    const heightInMeters = user.height / 100;
    const bmi = user.weight / (heightInMeters * heightInMeters);
    let category = "";
    let color = "";

    if (bmi < 18.5) {
      category = "Underweight";
      color = "#3498db";
    } else if (bmi >= 18.5 && bmi < 24.9) {
      category = "Healthy Weight";
      color = "#2ecc71";
    } else if (bmi >= 25 && bmi < 29.9) {
      category = "Overweight";
      color = "#f1c40f";
    } else {
      category = "Obese";
      color = "#e74c3c";
    }
    return { bmi: bmi.toFixed(1), category, color };
  };

  const renderBmi = () => {
    const { bmi, category, color } = calculateBmi();
    if (!bmi) {
      return <Text style={styles.bmiText}>Enter height and weight to calculate BMI.</Text>;
    }

    return (
      <View style={styles.bmiContainer}>
        <Text style={styles.bmiValue}>{bmi}</Text>
        <Text style={[styles.bmiCategory, { color }]}>{category}</Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#1c1c2e", "#2c2c4e"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileHeader}>
          <Ionicons name="person-circle-outline" size={120} color="rgba(255, 255, 255, 0.8)" style={styles.avatar} />
          <Text style={styles.userName}>{user?.name || "Guest"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.detailsList}>
            <DetailItem icon="person-outline" label="Name" value={user?.name || 'N/A'} />
            <DetailItem icon="mail-outline" label="Email" value={user?.email || 'N/A'} />
            <DetailItem icon="call-outline" label="Phone" value={user?.phoneNumber || 'N/A'} />
            <DetailItem icon="calendar-outline" label="Age" value={user?.age?.toString() || 'N/A'} />
            <DetailItem icon="transgender-outline" label="Gender" value={user?.gender || 'N/A'} />
            <DetailItem icon="body-outline" label="Height" value={user?.height ? `${user.height} cm` : 'N/A'} />
            <DetailItem icon="barbell-outline" label="Weight" value={user?.weight ? `${user.weight} kg` : 'N/A'} />
          </View>
        </View>

        <View style={styles.healthSummarySection}>
          <Text style={styles.sectionTitle}>Health Summary</Text>
          {renderBmi()}
        </View>

        <View style={styles.menuContainer}>
          <MenuItem
            icon="create-outline"
            text="Edit Profile"
            onPress={() => setModalVisible(true)}
          />
          <MenuItem
            icon="log-out-outline"
            text="Logout"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} keyboardType="number-pad" placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Gender" value={gender} onChangeText={setGender} placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" placeholderTextColor="#999" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleUpdateProfile}>
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userEmail: {
    fontSize: 16,
    color: "#E0E0E0",
    marginTop: 5,
  },
  detailsSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  detailsList: {
    marginTop: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  detailIcon: {
    marginRight: 15,
  },
  detailLabel: {
    fontSize: 16,
    color: '#BDBDBD',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  healthSummarySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  bmiContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bmiCategory: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 5,
  },
  bmiText: {
    fontSize: 16,
    color: '#BDBDBD',
    textAlign: 'center',
    marginTop: 15,
  },
  menuContainer: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  menuItemText: {
    flex: 1,
    marginLeft: 20,
    fontSize: 16,
    color: "#E0E0E0",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#2C2C4E",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#4A90E2",
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: "#555",
    marginLeft: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Profile;
