import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
interface Props {
  title: string;
  showButton?: boolean;
  setShowButton?: (showButton: boolean) => void;
}

const Header = ({ title, showButton, setShowButton }: Props) => {
  const navigation = useNavigation<any>();

  const handleBackButtonPress = () => {
    if (setShowButton) {
      setShowButton(false);
    }
    navigation.goBack();
  };

  return (
    <>
      <View style={styles.component}>
        {showButton && (
          <TouchableOpacity onPress={() => handleBackButtonPress()}>
            <Ionicons name={"arrow-back"} size={24} color={"#485696"} />
          </TouchableOpacity>
        )}
        <View style={styles.header}>
          <Text style={showButton ? styles.titleWithButton : styles.title}>
            {title}
          </Text>
        </View>
        <View></View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontFamily: "Times New Roman, Times, serif",
    alignSelf: "center",
    textAlign: "center",
    fontSize: 16,
    color: "#485696",
  },

  titleWithButton: {
    alignSelf: "center",
    textAlign: "center",
    fontSize: 16,
    color: "#485696",
    marginRight: 50,
  },
  component: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "lightgray",
    borderBottomWidth: 1,
    width: "90%",
    marginLeft: "5%",
    marginTop: 30,
    marginBottom: 30,
  },
});
export default Header;
