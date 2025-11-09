import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TechDashboard } from '../screens/TechDashboard';
import { InstallWorkflowScreen } from '../screens/workflows/InstallWorkflowScreen';
import { DemoWorkflowScreen } from '../screens/workflows/DemoWorkflowScreen';
import { CheckServiceWorkflowScreen } from '../screens/workflows/CheckServiceWorkflowScreen';
import { PullWorkflowScreen } from '../screens/workflows/PullWorkflowScreen';

export type RootStackParamList = {
  TechDashboard: undefined;
  InstallWorkflow: { jobId: string };
  DemoWorkflow: { jobId: string };
  CheckServiceWorkflow: { jobId: string };
  PullWorkflow: { jobId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="TechDashboard"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF6B35',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="TechDashboard"
          component={TechDashboard}
          options={{ title: 'My Jobs' }}
        />
        <Stack.Screen
          name="InstallWorkflow"
          component={InstallWorkflowScreen}
          options={{ title: 'Install Workflow' }}
        />
        <Stack.Screen
          name="DemoWorkflow"
          component={DemoWorkflowScreen}
          options={{ title: 'Demo Workflow' }}
        />
        <Stack.Screen
          name="CheckServiceWorkflow"
          component={CheckServiceWorkflowScreen}
          options={{ title: 'Check Service' }}
        />
        <Stack.Screen
          name="PullWorkflow"
          component={PullWorkflowScreen}
          options={{ title: 'Pull Workflow' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
