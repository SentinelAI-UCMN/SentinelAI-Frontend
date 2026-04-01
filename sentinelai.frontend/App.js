import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from './src/screens/DashboardScreen';
import LiveAnalysisScreen from './src/screens/LiveAnalysisScreen';
import IncidentDetailScreen from './src/screens/IncidentDetailScreen';
import UploadScreen from './src/screens/UploadScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0A0E1A',
            borderTopColor: '#1A2035',
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 65,
          },
          tabBarActiveTintColor: '#00F5C4',
          tabBarInactiveTintColor: '#3A4560',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.5,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Dashboard') {
              iconName = focused ? 'grid' : 'grid-outline';
            } else if (route.name === 'Upload') {
              iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
            } else if (route.name === 'Live Analysis') {
              iconName = focused ? 'videocam' : 'videocam-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardStack} />
        <Tab.Screen name="Upload" component={UploadScreen} />
        <Tab.Screen name="Live Analysis" component={LiveAnalysisScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}