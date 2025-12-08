import { registerUser } from "@core/modules/auth/api.auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as yup from "yup";

const schema = yup.object().shape({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function RegisterPage() {
  const router = useRouter();
  const { mutate, isPending, error } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      Alert.alert("Success", "Account created! Please log in.");
      setTimeout(() => {
        router.push("/(auth)/login");
      }, 1000);
    },
    onError: (err) => {
      Alert.alert("Error", (err as Error).message);
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    mutate({
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>📍</Text>
        </View>
        <Text style={styles.heading}>Artevelde Attendance</Text>
        <Text style={styles.subheading}>Make a new account</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{(error as Error).message}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="first_name"
          render={({ field: { onChange, value, onBlur } }) => (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>First name</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isPending}
              />
              {errors.first_name && (
                <Text style={styles.fieldError}>
                  {errors.first_name.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="last_name"
          render={({ field: { onChange, value, onBlur } }) => (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Last name</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isPending}
              />
              {errors.last_name && (
                <Text style={styles.fieldError}>
                  {errors.last_name.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value, onBlur } }) => (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="Your.name@student.arteveldehs.be"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isPending}
              />
              {errors.email && (
                <Text style={styles.fieldError}>{errors.email.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value, onBlur } }) => (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                editable={!isPending}
              />
              {errors.password && (
                <Text style={styles.fieldError}>{errors.password.message}</Text>
              )}
            </View>
          )}
        />

        <TouchableOpacity
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          <Text style={styles.buttonText}>
            {isPending ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>
          Already have an account?{" "}
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Log in here</Text>
            </TouchableOpacity>
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
  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "flex-start",
    gap: 24,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#f2994a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    backgroundColor: "#fff",
  },
  radioSelected: {
    borderColor: "#f2994a",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f2994a",
  },
  radioLabel: {
    fontSize: 16,
    color: "#222",
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
  buttonDisabled: {
    opacity: 0.6,
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
  fieldContainer: {
    marginBottom: 12,
    width: "100%",
  },
  fieldError: {
    color: "#c33",
    fontSize: 12,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: "#fee",
    borderColor: "#f2994a",
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
    width: "100%",
  },
  errorText: {
    color: "#c33",
    fontSize: 14,
  },
});
