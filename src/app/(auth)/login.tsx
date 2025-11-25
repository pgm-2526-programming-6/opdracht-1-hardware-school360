import { Link } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    // You can add validation here
    Alert.alert("Login Info", `Email: ${email}\nPassword: ${password}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>📍</Text>
        </View>
        <Text style={styles.heading}>Artevelde Attendance</Text>
        <Text style={styles.subheading}>Log in to your account</Text>
        <Text style={styles.label}>E-mailadress</Text>
        <TextInput
          style={styles.input}
          placeholder="Your.name@student.arteveldehs.be"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="………"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
        <Text style={styles.registerText}>
          Don’t have an account yet?{" "}
          <Link href="/(auth)/register" style={styles.registerLink}>
            Register here
          </Link>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f6f8",
  },
  card: {
    width: "95%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f2994a",
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f2994a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 36,
    color: "#fff",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    color: "#444",
    marginBottom: 18,
    textAlign: "center",
  },
  label: {
    alignSelf: "flex-start",
    fontWeight: "bold",
    color: "#222",
    marginTop: 8,
    marginBottom: 4,
    fontSize: 16,
  },
  input: {
    width: "100%",
    height: 44,
    borderColor: "#f2994a",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#f2994a",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerText: {
    color: "#222",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  registerLink: {
    textDecorationLine: "underline",
    fontWeight: "bold",
    color: "#222",
  },
});
