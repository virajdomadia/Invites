import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { GoogleSignInButton } from '../components/google-sign-in-button';
import { router } from 'expo-router';

export default function LoginScreen() {
  const handleSignInSuccess = (isNewUser: boolean) => {
    if (isNewUser) {
      // New user - redirect to registration/profile completion
      router.replace('/register');
    } else {
      // Existing user - redirect to home
      router.replace('/');
    }
  };

  const handleSignInError = (error: string) => {
    Alert.alert('Sign In Failed', error);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Invites</Text>
          <Text style={styles.subtitle}>Sign in to get started</Text>
        </View>

        <View style={styles.formContainer}>
          <GoogleSignInButton
            onSuccess={handleSignInSuccess}
            onError={handleSignInError}
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Why Google Sign-In?</Text>
            <Text style={styles.infoText}>
              • Quick and secure authentication{'\n'}
              • No need to remember passwords{'\n'}
              • Automatic account protection
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  formContainer: {
    marginBottom: 40,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9ca3af',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
  footer: {
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
});
