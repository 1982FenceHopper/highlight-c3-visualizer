import type { DataPoint, Dataset } from "./interfaces";
import {
  SeasonalNaiveModel,
  HoltWintersModel,
  ForecastModel,
  DriftModel,
  SimpleNaiveModel,
} from "./classes";

function checkSeasonality(years: number[], values: number[]): boolean {
  if (years.length < 24 || values.length < 24) {
    return false;
  }
  const interval = years[1] - years[0];
  const seasonalPeriod = Math.round(1 / interval);

  const meanValue =
    values.reduce((sum, value) => sum + value, 0) / values.length;
  const normalizedValues = values.map((value) => value - meanValue);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < values.length - seasonalPeriod; i++) {
    numerator += normalizedValues[i] * normalizedValues[i + seasonalPeriod];
    denominator += normalizedValues[i] * normalizedValues[i];
  }

  const autocorrelation = numerator / denominator;

  return autocorrelation > 0.5;
}

function checkTrend(years: number[], values: number[]): boolean {
  const n = years.length;
  const sumX = years.reduce((sum, year) => sum + year, 0);
  const sumY = values.reduce((sum, value) => sum + value, 0);
  const sumXY = years.reduce((sum, year, i) => sum + year * values[i], 0);
  const sumX2 = years.reduce((sum, year) => sum + year * year, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const yMean = sumY / n;
  const ssTotal = values.reduce(
    (sum, value) => sum + Math.pow(value - yMean, 2),
    0
  );
  const ssResidual = values.reduce((sum, value, i) => {
    const prediction = slope * years[i] + intercept;
    return sum + Math.pow(value - prediction, 2);
  }, 0);
  const rSquared = 1 - ssResidual / ssTotal;

  return rSquared > 0.5;
}

function createForecaster(data: DataPoint[]): ForecastModel {
  const [years, values] = new SeasonalNaiveModel().preprocess(data);
  const length = values.length;
  const hasSeasonality = checkSeasonality(years, values);
  const hasTrend = checkTrend(years, values);

  if (hasSeasonality && length >= 18) {
    return new HoltWintersModel();
  } else if (hasSeasonality) {
    return new SeasonalNaiveModel();
  } else if (hasTrend) {
    return new DriftModel();
  } else {
    return new SimpleNaiveModel();
  }
}

async function forecast(
  dataset: Dataset,
  horizon: number
): Promise<{ predictions: number[]; model_used: string }> {
  const model = createForecaster(dataset.idx_item_data.contents);
  model.fit(dataset.idx_item_data.contents);
  const predictions = model.forecast(horizon);
  return {
    predictions,
    model_used:
      model instanceof HoltWintersModel
        ? "Holt-Winters Exponential Smoothing"
        : model instanceof SeasonalNaiveModel
        ? "Seasonal Naive Forecasting"
        : model instanceof DriftModel
        ? "Drift Forecasting"
        : "Simple Naive Forecasting",
  };
}

export { forecast };
