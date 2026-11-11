import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {Colors} from '../../constants/colors';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* Top branding */}
      <View style={styles.brandContainer}>
        <Text style={styles.schoolName}>
          RYDIMMA EDUCATIONAL
        </Text>

        <Text style={styles.schoolName}>
          COMPLEX
        </Text>

        <Image
          source={require('../../assets/images/crest.png')}
          style={styles.crest}
          resizeMode="contain"
        />
      </View>

      {/* Welcome content */}
      <View style={styles.content}>

        <Text style={styles.welcome}>
          Welcome to
        </Text>

        <Text style={styles.title}>
          Rydimma Educational
        </Text>

        <Text style={styles.title}>
          Complex
        </Text>

        <View style={styles.divider} />

        <Text style={styles.description}>
          A smart and unified platform that connects
          students, teachers, parents and the
          school community.
        </Text>

      </View>

      {/* Bottom section */}
      <View style={styles.bottomContainer}>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/role')}
        >
          <Text style={styles.buttonText}>
            Get Started
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color={Colors.white}
          />
        </TouchableOpacity>

        <Text style={styles.community}>
          One School. One Community.
        </Text>

        <Text style={styles.motto}>
          God First in Everything We Do.
        </Text>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
  },

  brandContainer: {
    alignItems: 'center',
    marginTop: 25,
  },

  schoolName: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  crest: {
    width: width * 0.48,
    height: width * 0.48,
    marginTop: 12,
  },

  content: {
    alignItems: 'center',
    marginTop: 10,
  },

  welcome: {
    fontSize: 22,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 8,
  },

  title: {
    fontSize: 26,
    color: Colors.primary,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
  },

  divider: {
    width: 45,
    height: 3,
    backgroundColor: Colors.primary,
    marginVertical: 18,
    borderRadius: 10,
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 330,
  },

  bottomContainer: {
    marginTop: 'auto',
    paddingBottom: 25,
  },

  button: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },

  buttonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },

  community: {
    textAlign: 'center',
    color: Colors.text,
    fontSize: 14,
    marginBottom: 5,
  },

  motto: {
    textAlign: 'center',
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});