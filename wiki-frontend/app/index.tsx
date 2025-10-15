import React, { useState } from 'react';
import { router } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WelcomeScreen = ({ onStart }: { onStart: () => void }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/images/icon.jpg')}
        style={styles.welcomeImage}
        resizeMode="contain"
      />

      <Text style={styles.welcomeTitle}>Wiki de Saberes Compartidos</Text>
      <Text style={styles.welcomeSubtitle}>"Conocimiento que nos une."</Text>
      <TouchableOpacity style={styles.startButton} onPress={onStart}>
        <Text style={styles.startButtonText}>Comenzar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const LoginScreen = ({ onRegister, onLogin }: { onRegister: () => void; onLogin: (email: string, password: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginPress = async () => {
    if (!email || !password) {
      setError('Correo electrónico y contraseña son requeridos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://wiki-project-back.vercel.app/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('userId', data.user._id);
        onLogin(email, password);
        router.push('/home');
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/icon.jpg')} style={styles.logo} />
      <Text style={styles.title}>Iniciar Sesión</Text>
      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="********"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity>
        <Text style={styles.forgot}>¿Olvidaste la contraseña?</Text>
      </TouchableOpacity>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.buttonGray]} onPress={handleLoginPress} disabled={loading}>
          <Text style={styles.buttonTextBlack}>{loading ? 'Cargando...' : 'Iniciar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={onRegister}>
          <Text style={styles.buttonTextWhite}>Registrarse</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.orText}>o</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.socialRow}>
        <TouchableOpacity><Image source={require('../assets/images/icon.jpg')} style={styles.socialIcon} /></TouchableOpacity>
        <TouchableOpacity><Image source={require('../assets/images/icon.jpg')} style={styles.socialIcon} /></TouchableOpacity>
        <TouchableOpacity><Image source={require('../assets/images/icon.jpg')} style={styles.socialIcon} /></TouchableOpacity>
      </View>
      <View style={styles.registerContainer}>
        <Text>¿No tienes una cuenta? </Text>
        <TouchableOpacity onPress={onRegister}>
          <Text style={styles.registerText}>Regístrate aquí</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const RegisterScreen = ({ onBackToLogin }: { onBackToLogin: () => void }) => {
  const [dni, setDni] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegisterPress = async () => {
    if (!dni || !username || !email || !password) {
      setError('Todos los campos son requeridos');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('https://wiki-project-back.vercel.app/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, username, email, password, role: 'user' }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
        setDni('');
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        setError(data.error || 'Error al registrar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/icon.jpg')} style={styles.logo} />
      <Text style={styles.title}>Registrarse</Text>
      <Text style={styles.label}>DNI</Text>
      <TextInput
        style={styles.input}
        placeholder="DNI"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={dni}
        onChangeText={setDni}
      />
      <Text style={styles.label}>Nombre de usuario</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        placeholderTextColor="#999"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="********"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.buttonGray]} onPress={handleRegisterPress} disabled={loading}>
          <Text style={styles.buttonTextBlack}>{loading ? 'Registrando...' : 'Registrar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={onBackToLogin}>
          <Text style={styles.buttonTextWhite}>Volver al Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Index() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleStart = () => {
    setShowLogin(true);
  };

  const handleLogin = (email: string, password: string) => {
    console.log('Login:', { email, password });

  };

  const handleRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  if (showRegister) {
    return <RegisterScreen onBackToLogin={handleBackToLogin} />;
  } else if (showLogin) {
    return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />;
  } else {
    return <WelcomeScreen onStart={handleStart} />;
  }
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  logo: { width: 80, height: 80, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
  label: { alignSelf: 'flex-start', fontWeight: '600', marginBottom: 5, color: '#000' },
  input: { width: '100%', borderColor: '#ddd', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15, color: '#000' },
  forgot: { color: '#3366FF', alignSelf: 'flex-start', marginBottom: 20, fontSize: 14 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  button: { flex: 1, padding: 15, borderRadius: 25, marginHorizontal: 5, alignItems: 'center' },
  buttonGray: { backgroundColor: '#DDD' },
  buttonBlue: { backgroundColor: '#3366FF' },
  buttonTextBlack: { color: '#000', fontWeight: 'bold' },
  buttonTextWhite: { color: '#FFF', fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#CCC' },
  orText: { marginHorizontal: 10, color: '#999' },
  socialRow: { flexDirection: 'row', justifyContent: 'space-around', width: '60%' },
  socialIcon: { width: 40, height: 40 },
  welcomeImage: { width: 120, height: 120, alignSelf: 'center', marginBottom: 30 },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  welcomeSubtitle: { fontSize: 18, fontStyle: 'italic', textAlign: 'center', marginBottom: 40, color: '#555' },
  startButtonText: { color: 'white', fontSize: 18, textAlign: 'center', fontWeight: '600' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 26 },
  registerText: { color: '#2563EB', fontWeight: 'bold' },
  error: {
    color: 'red',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  success: {
    color: 'green',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  startButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: 'center',
    minWidth: 160,
  },
});
