import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'CheckServiceWorkflow'>;

export const CheckServiceWorkflowScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { jobId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Card title="Check Service Workflow">
        <Text style={styles.text}>Job ID: {jobId}</Text>
        <Text style={styles.description}>
          This is the Check Service Workflow screen. The full check service
          workflow will be implemented here.
        </Text>
        <Button onPress={() => navigation.goBack()} style={styles.button}>
          Back to Dashboard
        </Button>
      </Card>

      <Card title="Check Service Steps">
        <View style={styles.stepsList}>
          <Text style={styles.step}>1. Start Visit</Text>
          <Text style={styles.step}>2. Environmental Check</Text>
          <Text style={styles.step}>3. Equipment Status</Text>
          <Text style={styles.step}>4. Room Readings</Text>
          <Text style={styles.step}>5. Drying Assessment</Text>
          <Text style={styles.step}>6. Equipment Adjust</Text>
          <Text style={styles.step}>7. Complete Visit</Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  text: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  stepsList: {
  },
  step: {
    marginBottom: 8,
    fontSize: 14,
    color: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
});
