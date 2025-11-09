import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'DemoWorkflow'>;

export const DemoWorkflowScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Card title="Demo Workflow">
        <Text style={styles.text}>Job ID: {jobId}</Text>
        <Text style={styles.description}>
          This is the Demo Workflow screen. The full demo workflow will be
          implemented here.
        </Text>
        <Button onPress={() => navigation.goBack()} style={styles.button}>
          Back to Dashboard
        </Button>
      </Card>

      <Card title="Demo Steps">
        <View style={styles.stepsList}>
          <Text style={styles.step}>1. Clock In</Text>
          <Text style={styles.step}>2. Pre-Demo Photos</Text>
          <Text style={styles.step}>3. PPE & Supplies</Text>
          <Text style={styles.step}>4. Demo Execution</Text>
          <Text style={styles.step}>5. Exposed Materials</Text>
          <Text style={styles.step}>6. Post-Demo Readings</Text>
          <Text style={styles.step}>7. Post-Demo Photos</Text>
          <Text style={styles.step}>8. Debris Disposal</Text>
          <Text style={styles.step}>9. Equipment Adjustment</Text>
          <Text style={styles.step}>10. Complete</Text>
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
