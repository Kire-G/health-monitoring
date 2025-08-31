import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Switch,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppContext } from "@/context/AppContext";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { USER } from "@/config/axiosConfig";
import { DoctorDetails } from "@/constants/UserDetails";

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
  const [age, setAge] = useState(user?.age?.toString());
  const [gender, setGender] = useState(user?.gender);
  const [height, setHeight] = useState(user?.height?.toString());
  const [weight, setWeight] = useState(user?.userDetails?.weight?.toString());
  const [genderDropdownVisible, setGenderDropdownVisible] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;


  const [doctorDetails, setDoctorDetails] = useState<DoctorDetails>({
    doctorName: user?.doctorDetails?.doctorName || '',
    doctorEmail: user?.doctorDetails?.doctorEmail || '',
    doctorPhone: user?.doctorDetails?.doctorPhone || '',
  });
  const [doctorModalVisible, setDoctorModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAge(user.age?.toString());
      setGender(user.userDetails?.gender);
      setHeight(user.userDetails?.height?.toString());
      setWeight(user.userDetails?.weight?.toString());

      setDoctorDetails({
        doctorName: user?.doctorDetails?.doctorName || '',
        doctorEmail: user?.doctorDetails?.doctorEmail || '',
        doctorPhone: user?.doctorDetails?.doctorPhone || '',
      });
    }
  }, [user]);

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
        age: age ? parseInt(age) : undefined,
        userDetails: {
          height: height ? parseFloat(height) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          gender,

        },
        doctorDetails: doctorDetails,
      };
      const response = await axios.put(`${USER}/${user.id}`, updatedDetails);
      setUser(prevUser => ({
        ...prevUser,
        ...response.data,
        userDetails: {
          ...prevUser?.userDetails,
          ...response.data.userDetails,
        },
        doctorDetails: {
          ...prevUser?.doctorDetails,
          ...response.data.doctorDetails,
        },
      }));
      if (response.data.doctorDetails) {
        setDoctorDetails(response.data.doctorDetails);
      }

      Alert.alert("Success", "Profile updated successfully!");
      setModalVisible(false);
      setDoctorModalVisible(false);
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

        <TouchableOpacity style={styles.detailsSection} activeOpacity={0.8} onPress={() => setModalVisible(true)}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.detailsList}>
            <DetailItem icon="person-outline" label="Name" value={user?.name || 'N/A'} />
            <DetailItem icon="mail-outline" label="Email" value={user?.email || 'N/A'} />
            <DetailItem icon="calendar-outline" label="Age" value={user?.age?.toString() || 'N/A'} />
            <DetailItem
                icon="transgender-outline"
                label="Gender"
                value={user?.userDetails?.gender || "N/A"}
              />
              <DetailItem
                icon="body-outline"
                label="Height"
                value={user?.userDetails?.height ? `${user.userDetails.height} cm` : "N/A"}
              />
              <DetailItem
                icon="barbell-outline"
                label="Weight"
                value={user?.userDetails?.weight ? `${user.userDetails.weight} kg` : "N/A"}
              />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.detailsSection} activeOpacity={0.8} onPress={() => setDoctorModalVisible(true)}>
          <Text style={styles.sectionTitle}>Doctor Details</Text>
          <View style={styles.detailsList}>
            <DetailItem icon="person-outline" label="Name" value={doctorDetails.doctorName?.trim() ? doctorDetails.doctorName : 'N/A'} />
            <DetailItem icon="mail-outline" label="Email" value={doctorDetails.doctorEmail?.trim() ? doctorDetails.doctorEmail : 'N/A'} />
            <DetailItem icon="call-outline" label="Phone" value={doctorDetails.doctorPhone?.trim() ? doctorDetails.doctorPhone : 'N/A'} />
          </View>
        </TouchableOpacity>

        <View style={styles.menuContainer}>
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
            <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} keyboardType="number-pad" placeholderTextColor="#999" />
            <View style={[styles.genderContainer, genderDropdownVisible ? styles.genderContainerActive : null]}>
              <TouchableOpacity
                style={styles.genderHeader}
                activeOpacity={0.8}
                onPress={() => {
                  const toValue = genderDropdownVisible ? 0 : 1;
                  setGenderDropdownVisible(!genderDropdownVisible);
                  Animated.timing(dropdownAnim, {
                    toValue,
                    duration: 220,
                    useNativeDriver: false,
                  }).start();
                }}
              >
                <Text style={styles.genderHeaderText}>
                  {gender ? gender : 'Select Gender'}
                </Text>
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: dropdownAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '180deg'],
                        }),
                      },
                    ],
                  }}
                >
                  <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
                </Animated.View>
              </TouchableOpacity>
              <Animated.View
                style={[
                  styles.dropdownContainer,
                  {
                    maxHeight: dropdownAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 100] }),
                    opacity: dropdownAnim,
                  },
                ]}
              >
                {['Male', 'Female'].map((option, idx) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownItem,
                      idx === 1 ? { borderBottomWidth: 0 } : null,
                    ]}
                    onPress={() => {
                      setGender(option);
                      Animated.timing(dropdownAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: false,
                      }).start(() => setGenderDropdownVisible(false));
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>
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
      {/* Doctor Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={doctorModalVisible}
        onRequestClose={() => setDoctorModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Doctor Details</Text>
            <TextInput style={styles.input} placeholder="Doctor Name" value={doctorDetails.doctorName} onChangeText={text => setDoctorDetails({ ...doctorDetails, doctorName: text })} placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Doctor Email" value={doctorDetails.doctorEmail} onChangeText={text => setDoctorDetails({ ...doctorDetails, doctorEmail: text })} keyboardType="email-address" placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Doctor Phone" value={doctorDetails.doctorPhone} onChangeText={text => setDoctorDetails({ ...doctorDetails, doctorPhone: text })} keyboardType="phone-pad" placeholderTextColor="#999" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleUpdateProfile}>
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setDoctorModalVisible(false)}>
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    color: '#E0E0E0',
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
  dropdownContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginTop: 0,
    marginBottom: 0,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  genderContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 0,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  genderContainerActive: {
    borderWidth: 1,
    borderColor: '#8A84FF',
  },
  genderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  genderHeaderText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default Profile;
