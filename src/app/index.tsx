import { Redirect } from 'expo-router';
import useAuth from '../components/functional/auth/useAuth'; // Als je een auth hook hebt

export default function Index() {
  const { user } = useAuth(); // Haal de authenticatiestatus op
  // Als de gebruiker is ingelogd, ga naar de hoofdapp-groep
  if (user) {
    return <Redirect href="/home" />; 
  }
  
  // Als de gebruiker niet is ingelogd, ga naar de login-pagina
  return <Redirect href="/login" />;
}