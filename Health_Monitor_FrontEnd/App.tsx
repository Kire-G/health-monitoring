import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, StyleSheet, Text } from "react-native";
import Register from "./app/Register";
import Profile from "./app/profile";
import Home from "./app/Home";
import { AppProvider } from "./context/AppContext";
import Login from "./app/Login";
import History from "./app/History";
import Monitoring from "./app/Monitoring";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      id={null}
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="History"
        component={History}
        options={{
          tabBarStyle: styles.tabBar,
          tabBarIcon: ({ focused }) => (
            <View
              style={focused ? styles.tabBarIconFocused : styles.tabBarIcon}
            >
              <Ionicons
                name={focused ? "library-sharp" : "library-outline"}
                size={26}
                color={"#485696"}
              />
              {!focused && (
                <Text style={focused ? styles.textFocused : styles.text}>
                  History
                </Text>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <View
              style={focused ? styles.tabBarIconFocused : styles.tabBarIcon}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={30}
                color={"#485696"}
              />
              {!focused && (
                <Text style={focused ? styles.textFocused : styles.text}>
                  Home
                </Text>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarStyle: styles.tabBar,
          tabBarIcon: ({ focused }) => (
            <View
              style={focused ? styles.tabBarIconFocused : styles.tabBarIcon}
            >
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={26}
                color={"#485696"}
              />
              {!focused && (
                <Text style={focused ? styles.textFocused : styles.text}>
                  Profile
                </Text>
              )}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator
          id={null}
          initialRouteName="Login"
          screenOptions={{ headerShown: false, statusBarAnimation: "fade" }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="History" component={History} />
          <Stack.Screen name="Monitoring" component={Monitoring} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    width: "100%",
    paddingTop: 15,
    borderRadius: 10,
    backgroundColor: "white",
    height: 100,
    elevation: 3,
    alignContent: "center",
  },

  tabBarIcon: {
    alignItems: "center",
  },

  tabBarIconMain: {
    alignItems: "center",
    height: 50,
    width: 50,
    justifyContent: "center",
  },

  tabBarIconFocused: {
    alignItems: "center",
    height: 50,
    width: 50,
    justifyContent: "space-around",
    borderBottomWidth: 3,
    borderBottomColor: "#f24c00",
    borderStyle: "solid",
    borderRadius: 3,
  },

  textFocused: {
    color: "#485696",
    width: 100,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "800",
  },

  text: {
    color: "#485696",
    textAlign: "center",
    width: 100,
    fontSize: 10,
    fontWeight: "500",
  },
});
