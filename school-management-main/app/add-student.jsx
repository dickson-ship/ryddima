import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { Colors } from "@/constants/colors";
import { useRoleGuard } from "@/hooks/use-role-guard";
import {db} from "../services/firebase"
import {setDoc,doc, serverTimestamp, collection, addDoc} from "firebase/firestore"

const CLASSES = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
];

export default function AddStudentScreen() {
  const { loading: checkingRole, user, allowed } = useRoleGuard("admin");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    otherName: "",
    dateOfBirth: "",
    gender: "",
    admissionNumber: "",
    className: "",
    admissionDate: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
  });

  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!form.firstName.trim()) {
      Alert.alert("Missing information", "Please enter the student's first name.");
      return false;
    }

    if (!form.lastName.trim()) {
      Alert.alert("Missing information", "Please enter the student's last name.");
      return false;
    }

    if (!form.dateOfBirth.trim()) {
      Alert.alert("Missing information", "Please enter the student's date of birth.");
      return false;
    }

    if (!form.gender) {
      Alert.alert("Missing information", "Please select the student's gender.");
      return false;
    }

    if (!form.admissionNumber.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter the admission number."
      );
      return false;
    }

    if (!form.className) {
      Alert.alert("Missing information", "Please select a class.");
      return false;
    }

    if (!form.parentName.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter the parent or guardian's name."
      );
      return false;
    }

    if (!form.parentPhone.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter the parent or guardian's phone number."
      );
      return false;
    }

    if (
      form.parentEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parentEmail.trim())
    ) {
      Alert.alert(
        "Invalid email",
        "Please enter a valid parent email address."
      );
      return false;
    }

    return true;
  };

  const handleAddStudent = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      await addDoc(collection(db, "students"), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        otherName: form.otherName.trim(),

        dateOfBirth: form.dateOfBirth.trim(),
        gender: form.gender,

        admissionNumber: form.admissionNumber.trim().toUpperCase(),
        className: form.className,
        admissionDate: form.admissionDate.trim(),

        parent: {
          name: form.parentName.trim(),
          phone: form.parentPhone.trim(),
          email: form.parentEmail.trim(),
        },

        status: "Active",

        stats: {
          attendance: 0,
          academicAverage: 0,
          feeBalance: 0,
        },

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("Student:", form);

      Alert.alert(
        "Student Added",
        `${form.firstName} ${form.lastName} has been added successfully.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Add student error:", error);

      Alert.alert(
        "Unable to add student",
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingRole) {
    return <SafeAreaView style={styles.container}><View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View></SafeAreaView>;
  }
  if (!user || !allowed) return <Redirect href="/(auth)" />;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={10}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={Colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Student</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {/* PHOTO */}
          <View style={styles.photoSection}>
            <TouchableOpacity
              style={styles.photoContainer}
              activeOpacity={0.8}
            >
              <Ionicons
                name="camera-outline"
                size={28}
                color={Colors.primary}
              />

              <View style={styles.cameraBadge}>
                <Ionicons
                  name="add"
                  size={14}
                  color={Colors.white}
                />
              </View>
            </TouchableOpacity>

            <Text style={styles.photoTitle}>
              Student Photo
            </Text>

            <Text style={styles.photoSubtitle}>
              Optional
            </Text>
          </View>

          {/* PERSONAL INFORMATION */}
          <SectionTitle
            icon="person-outline"
            title="Personal Information"
          />

          <Input
            label="First Name"
            placeholder="Enter first name"
            value={form.firstName}
            onChangeText={(value) =>
              updateField("firstName", value)
            }
            required
          />

          <Input
            label="Last Name"
            placeholder="Enter last name"
            value={form.lastName}
            onChangeText={(value) =>
              updateField("lastName", value)
            }
            required
          />

          <Input
            label="Other Name"
            placeholder="Enter other name"
            value={form.otherName}
            onChangeText={(value) =>
              updateField("otherName", value)
            }
          />

          <Input
            label="Date of Birth"
            placeholder="DD/MM/YYYY"
            value={form.dateOfBirth}
            onChangeText={(value) =>
              updateField("dateOfBirth", value)
            }
            keyboardType="numbers-and-punctuation"
            required
          />

          {/* GENDER */}
          <Text style={styles.label}>
            Gender <Text style={styles.required}>*</Text>
          </Text>

          <TouchableOpacity
            style={styles.select}
            onPress={() =>
              setShowGenderPicker((previous) => !previous)
            }
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.selectText,
                !form.gender && styles.placeholder,
              ]}
            >
              {form.gender || "Select gender"}
            </Text>

            <Ionicons
              name={
                showGenderPicker
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={19}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {showGenderPicker && (
            <View style={styles.dropdown}>
              {["Male", "Female"].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={styles.dropdownItem}
                  onPress={() => {
                    updateField("gender", gender);
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={styles.dropdownText}>
                    {gender}
                  </Text>

                  {form.gender === gender && (
                    <Ionicons
                      name="checkmark"
                      size={19}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* SCHOOL INFORMATION */}
          <SectionTitle
            icon="school-outline"
            title="School Information"
          />

          <Input
            label="Admission Number"
            placeholder="e.g. RYD-2026-001"
            value={form.admissionNumber}
            onChangeText={(value) =>
              updateField(
                "admissionNumber",
                value.toUpperCase()
              )
            }
            autoCapitalize="characters"
            required
          />

          {/* CLASS */}
          <Text style={styles.label}>
            Class <Text style={styles.required}>*</Text>
          </Text>

          <TouchableOpacity
            style={styles.select}
            onPress={() =>
              setShowClassPicker((previous) => !previous)
            }
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.selectText,
                !form.className && styles.placeholder,
              ]}
            >
              {form.className || "Select class"}
            </Text>

            <Ionicons
              name={
                showClassPicker
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={19}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {showClassPicker && (
            <View style={styles.dropdown}>
              {CLASSES.map((className) => (
                <TouchableOpacity
                  key={className}
                  style={styles.dropdownItem}
                  onPress={() => {
                    updateField("className", className);
                    setShowClassPicker(false);
                  }}
                >
                  <Text style={styles.dropdownText}>
                    {className}
                  </Text>

                  {form.className === className && (
                    <Ionicons
                      name="checkmark"
                      size={19}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Input
            label="Admission Date"
            placeholder="DD/MM/YYYY"
            value={form.admissionDate}
            onChangeText={(value) =>
              updateField("admissionDate", value)
            }
            keyboardType="numbers-and-punctuation"
          />

          {/* PARENT INFORMATION */}
          <SectionTitle
            icon="people-outline"
            title="Parent / Guardian"
          />

          <Input
            label="Parent / Guardian Name"
            placeholder="Enter full name"
            value={form.parentName}
            onChangeText={(value) =>
              updateField("parentName", value)
            }
            required
          />

          <Input
            label="Phone Number"
            placeholder="e.g. 024 XXX XXXX"
            value={form.parentPhone}
            onChangeText={(value) =>
              updateField("parentPhone", value)
            }
            keyboardType="phone-pad"
            required
          />

          <Input
            label="Email Address"
            placeholder="parent@example.com"
            value={form.parentEmail}
            onChangeText={(value) =>
              updateField("parentEmail", value)
            }
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* BUTTON */}
          <TouchableOpacity
            style={[
              styles.addStudentButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleAddStudent}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <Text style={styles.buttonText}>
                Adding Student...
              </Text>
            ) : (
              <>
                <Ionicons
                  name="person-add-outline"
                  size={20}
                  color={Colors.white}
                />

                <Text style={styles.buttonText}>
                  Add Student
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.requiredNote}>
            * Required fields
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({ icon, title }) {
  return (
    <View style={styles.sectionTitleContainer}>
      <View style={styles.sectionIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={Colors.primary}
        />
      </View>

      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  required = false,
  autoCapitalize = "sentences",
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label}

        {required && (
          <Text style={styles.required}> *</Text>
        )}
      </Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  keyboardContainer: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  /* HEADER */

  header: {
    height: 62,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textDark,
  },

  headerSpacer: {
    width: 40,
  },

  /* PHOTO */

  photoSection: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 28,
  },

  photoContainer: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },

  cameraBadge: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },

  photoTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },

  photoSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: Colors.textMuted,
  },

  /* SECTION */

  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 17,
  },

  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },

  /* INPUT */

  inputContainer: {
    marginBottom: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 7,
  },

  required: {
    color: Colors.danger,
  },

  input: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.text,
  },

  /* SELECT */

  select: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  selectText: {
    fontSize: 14,
    color: Colors.text,
  },

  placeholder: {
    color: Colors.textMuted,
  },

  dropdown: {
    backgroundColor: Colors.white,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: "hidden",
  },

  dropdownItem: {
    minHeight: 48,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  dropdownText: {
    fontSize: 14,
    color: Colors.text,
  },

  /* BUTTON */

  addStudentButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 15,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },

  requiredNote: {
    textAlign: "center",
    marginTop: 13,
    fontSize: 11,
    color: Colors.textMuted,
  },
});