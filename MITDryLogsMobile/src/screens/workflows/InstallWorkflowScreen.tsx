import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'InstallWorkflow'>;

export const InstallWorkflowScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Card title="Install Workflow">
        <Text style={styles.text}>Job ID: {jobId}</Text>
        <Text style={styles.description}>
          This is the Install Workflow screen. The full workflow with all steps
          (Front Door, Cause of Loss, Room Assessment, Equipment Calc, etc.) will
          be implemented here.
        </Text>
        <Button onPress={() => navigation.goBack()} style={styles.button}>
          Back to Dashboard
        </Button>
      </Card>

      <Card title="Workflow Steps">
        <View style={styles.stepsList}>
          <Text style={styles.step}>1. Front Door / Arrival</Text>
          <Text style={styles.step}>2. Cause of Loss</Text>
          <Text style={styles.step}>3. Add Rooms</Text>
          <Text style={styles.step}>4. Room Assessment</Text>
          <Text style={styles.step}>5. Moisture Mapping</Text>
          <Text style={styles.step}>6. Water Classification</Text>
          <Text style={styles.step}>7. Affected Materials</Text>
          <Text style={styles.step}>8. Equipment Calculation</Text>
          <Text style={styles.step}>9. Environmental Baseline</Text>
          <Text style={styles.step}>10. Partial Demo (if needed)</Text>
          <Text style={styles.step}>11. Plan Job</Text>
          <Text style={styles.step}>12. Office Preparation</Text>
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
    gap: 8,
  },
  step: {
    fontSize: 14,
    color: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
});
