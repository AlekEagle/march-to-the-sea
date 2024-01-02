export interface CalibrationPoint {
  input: number;
  output: number;
}

// A function to calibrate a number to a linear range based on a set of calibration points
// Calibration points should be an array of objects with input and output properties
// At least two calibration points are required
export function calibrateLinear(
  value: number,
  calibrationPoints: CalibrationPoint[],
): number {
  if (calibrationPoints.length < 2) {
    throw new Error('At least two calibration points are required');
  }

  const sortedPoints = calibrationPoints.sort((a, b) => a.input - b.input);

  const minInput = sortedPoints[0].input;
  const maxInput = sortedPoints[sortedPoints.length - 1].input;
  const minOutput = sortedPoints[0].output;
  const maxOutput = sortedPoints[sortedPoints.length - 1].output;

  if (value <= minInput) return minOutput;
  if (value >= maxInput) return maxOutput;

  const lowerPoint = sortedPoints.find((p) => p.input <= value);
  const upperPoint = sortedPoints.find((p) => p.input >= value);

  if (!lowerPoint || !upperPoint) {
    throw new Error('Could not find calibration points');
  }

  const slope =
    (upperPoint.output - lowerPoint.output) /
    (upperPoint.input - lowerPoint.input);
  const intercept = lowerPoint.output - slope * lowerPoint.input;

  return slope * value + intercept;
}

// A function to calibrate a number to a logarithmic range based on a set of calibration points
// Calibration points should be an array of objects with input and output properties
// At least two calibration points are required
export function calibrateLogarithmic(
  value: number,
  calibrationPoints: CalibrationPoint[],
): number {
  if (calibrationPoints.length < 2) {
    throw new Error('At least two calibration points are required');
  }

  const sortedPoints = calibrationPoints.sort((a, b) => a.input - b.input);

  const minInput = sortedPoints[0].input;
  const maxInput = sortedPoints[sortedPoints.length - 1].input;
  const minOutput = sortedPoints[0].output;
  const maxOutput = sortedPoints[sortedPoints.length - 1].output;

  if (value <= minInput) return minOutput;
  if (value >= maxInput) return maxOutput;

  const lowerPoint = sortedPoints.find((p) => p.input <= value);
  const upperPoint = sortedPoints.find((p) => p.input >= value);

  if (!lowerPoint || !upperPoint) {
    throw new Error('Could not find calibration points');
  }

  const slope =
    (upperPoint.output - lowerPoint.output) /
    Math.log(upperPoint.input / lowerPoint.input);
  const intercept = lowerPoint.output - slope * Math.log(lowerPoint.input);

  return slope * Math.log(value) + intercept;
}

// A function to calibrate a number to a power range based on a set of calibration points
// Calibration points should be an array of objects with input and output properties
// At least two calibration points are required
export function calibratePower(
  value: number,
  calibrationPoints: CalibrationPoint[],
): number {
  if (calibrationPoints.length < 2) {
    throw new Error('At least two calibration points are required');
  }

  const sortedPoints = calibrationPoints.sort((a, b) => a.input - b.input);

  const minInput = sortedPoints[0].input;
  const maxInput = sortedPoints[sortedPoints.length - 1].input;
  const minOutput = sortedPoints[0].output;
  const maxOutput = sortedPoints[sortedPoints.length - 1].output;

  if (value <= minInput) return minOutput;
  if (value >= maxInput) return maxOutput;

  const lowerPoint = sortedPoints.find((p) => p.input <= value);
  const upperPoint = sortedPoints.find((p) => p.input >= value);

  if (!lowerPoint || !upperPoint) {
    throw new Error('Could not find calibration points');
  }

  const slope =
    (upperPoint.output - lowerPoint.output) /
    (upperPoint.input ** 2 - lowerPoint.input ** 2);
  const intercept = lowerPoint.output - slope * lowerPoint.input ** 2;

  return slope * value ** 2 + intercept;
}
