import { MaterialMoistureTracking, DryingCurveData, DryingCurveDataPoint } from '../types';

/**
 * Generate drying curve data from material moisture tracking
 * Used in Check Service and Pull workflows to visualize drying progress
 */
export function generateDryingCurve(material: MaterialMoistureTracking): DryingCurveData {
  const dataPoints: DryingCurveDataPoint[] = material.readings.map((reading) => ({
    date: reading.timestamp,
    moisturePercent: reading.moisturePercent,
    visitNumber: reading.visitNumber,
    workflow: reading.workflowPhase,
  }));

  // Calculate trend based on last 2+ readings
  let trend: 'improving' | 'stable' | 'worsening' = 'unknown';
  if (dataPoints.length >= 2) {
    const recent = dataPoints[dataPoints.length - 1].moisturePercent;
    const previous = dataPoints[dataPoints.length - 2].moisturePercent;
    const diff = recent - previous;

    if (Math.abs(diff) <= 0.5) {
      trend = 'stable';
    } else if (diff < 0) {
      trend = 'improving';
    } else {
      trend = 'worsening';
    }
  }

  // Project dry date based on trend (simple linear projection)
  let projectedDryDate: string | undefined;
  if (trend === 'improving' && dataPoints.length >= 2) {
    const dryingRate = calculateDryingRate(dataPoints);
    if (dryingRate && dryingRate > 0) {
      const currentMoisture = dataPoints[dataPoints.length - 1].moisturePercent;
      const daysToDry = (currentMoisture - material.dryStandard) / dryingRate;

      if (daysToDry > 0 && daysToDry < 30) {
        const lastDate = new Date(dataPoints[dataPoints.length - 1].date);
        const projected = new Date(lastDate);
        projected.setDate(projected.getDate() + Math.ceil(daysToDry));
        projectedDryDate = projected.toISOString();
      }
    }
  }

  return {
    materialId: material.id,
    roomName: material.roomName,
    materialType: material.material,
    dryStandard: material.dryStandard,
    dataPoints,
    trend,
    projectedDryDate,
  };
}

/**
 * Calculate average daily drying rate (% moisture lost per day)
 */
function calculateDryingRate(dataPoints: DryingCurveDataPoint[]): number | null {
  if (dataPoints.length < 2) return null;

  // Get first and last readings
  const first = dataPoints[0];
  const last = dataPoints[dataPoints.length - 1];

  // Calculate days between readings
  const firstDate = new Date(first.date);
  const lastDate = new Date(last.date);
  const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysDiff <= 0) return null;

  // Calculate moisture change
  const moistureChange = first.moisturePercent - last.moisturePercent;

  // Return average daily rate
  return moistureChange / daysDiff;
}

/**
 * Generate SVG path data for drying curve chart
 * Can be used with a charting library or custom SVG rendering
 */
export function generateDryingCurvePath(
  dataPoints: DryingCurveDataPoint[],
  width: number,
  height: number,
  maxMoisture: number = 100
): string {
  if (dataPoints.length === 0) return '';

  // Find min/max for scaling
  const moistureValues = dataPoints.map(d => d.moisturePercent);
  const minMoisture = Math.min(...moistureValues);
  const maxY = Math.max(maxMoisture, Math.ceil(Math.max(...moistureValues) / 10) * 10);

  // Scale function for Y axis (moisture)
  const scaleY = (moisture: number) => {
    return height - ((moisture / maxY) * height);
  };

  // Scale function for X axis (time)
  const scaleX = (index: number) => {
    return (index / (dataPoints.length - 1)) * width;
  };

  // Generate SVG path
  const pathParts = dataPoints.map((point, index) => {
    const x = scaleX(index);
    const y = scaleY(point.moisturePercent);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  });

  return pathParts.join(' ');
}

/**
 * Get color for trend indicator
 */
export function getTrendColor(trend: 'improving' | 'stable' | 'worsening' | 'unknown'): string {
  switch (trend) {
    case 'improving':
      return '#10b981'; // Green
    case 'stable':
      return '#f59e0b'; // Amber
    case 'worsening':
      return '#ef4444'; // Red
    case 'unknown':
      return '#6b7280'; // Gray
  }
}

/**
 * Format projected dry date for display
 */
export function formatProjectedDryDate(isoDate: string | undefined): string {
  if (!isoDate) return 'Unable to estimate';

  const date = new Date(isoDate);
  const now = new Date();
  const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) {
    return 'Should be dry now';
  } else if (daysUntil === 0) {
    return 'Today';
  } else if (daysUntil === 1) {
    return 'Tomorrow';
  } else if (daysUntil <= 7) {
    return `In ${daysUntil} days`;
  } else {
    return date.toLocaleDateString();
  }
}
