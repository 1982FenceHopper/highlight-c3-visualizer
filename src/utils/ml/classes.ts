import type { DataPoint, Dataset } from "./interfaces";

abstract class ForecastModel {
  protected data: DataPoint[] = [];

  abstract fit(data: DataPoint[]): void;
  abstract forecast(horizon: number): number[];

  public preprocess(data: DataPoint[]): [number[], number[]] {
    const years = data.map((d) => parseInt(d.idx_year));
    const values = data.map((d) => parseFloat(d.idx_value));
    return [years, values];
  }
}

class SimpleNaiveModel extends ForecastModel {
  private lastValue: number = 0;

  fit(data: DataPoint[]): void {
    const [, values] = this.preprocess(data);
    this.lastValue = values[values.length - 1];
  }

  forecast(horizon: number): number[] {
    return Array(horizon).fill(this.lastValue);
  }
}

class SeasonalNaiveModel extends ForecastModel {
  private seasonalPeriod: number = 12;
  private lastCycle: number[] = [];

  fit(data: DataPoint[]): void {
    const [, values] = this.preprocess(data);
    this.lastCycle = values.slice(-this.seasonalPeriod);
  }

  forecast(horizon: number): number[] {
    return Array(horizon)
      .fill(0)
      .map((_, i) => this.lastCycle[i % this.seasonalPeriod]);
  }
}

class DriftModel extends ForecastModel {
  private lastValue: number = 0;
  private averageChange: number = 0;

  fit(data: DataPoint[]): void {
    const [, values] = this.preprocess(data);
    this.lastValue = values[values.length - 1];
    this.averageChange =
      (values[values.length - 1] - values[0]) / (values.length - 1);
  }

  forecast(horizon: number): number[] {
    return Array(horizon)
      .fill(0)
      .map((_, i) => this.lastValue + (i + 1) * this.averageChange);
  }
}

class HoltWintersModel extends ForecastModel {
  private level: number = 0;
  private trend: number = 0;
  private seasonal: number[] = [];
  private seasonalPeriod: number = 12;
  private alpha: number = 0.3;
  private beta: number = 0.1;
  private gamma: number = 0.1;

  fit(data: DataPoint[]): void {
    const [, values] = this.preprocess(data);

    if (values.length < this.seasonalPeriod - 2) {
      throw new Error(
        "Not enough data points for Holt-Winters Exponential Smoothing"
      );
    }

    this.initializeComponents(values);
    this.updateComponents(values);
  }

  private initializeComponents(values: number[]): void {
    this.level = values[0];
    this.trend =
      (values[this.seasonalPeriod] - values[0]) / this.seasonalPeriod;
    this.seasonal = values
      .slice(0, this.seasonalPeriod)
      .map((v) => v / this.level);
  }

  private updateComponents(values: number[]): void {
    for (let i = this.seasonalPeriod; i < values.length; i++) {
      const season = i % this.seasonalPeriod;
      const lastLevel = this.level;

      this.level =
        this.alpha * (values[i] / this.seasonal[season]) +
        (1 - this.alpha) * (this.level + this.trend);
      this.trend =
        this.beta * (this.level - lastLevel) + (1 - this.beta) * this.trend;
      this.seasonal[season] =
        this.gamma * (values[i] / this.level) +
        (1 - this.gamma) * this.seasonal[season];
    }
  }

  forecast(horizon: number): number[] {
    const result: number[] = [];
    let forecastLevel = this.level;
    let forecastTrend = this.trend;

    for (let i = 0; i < horizon; i++) {
      const season = i % this.seasonalPeriod;
      const forecast = (forecastLevel + forecastTrend) * this.seasonal[season];
      result.push(forecast);
      forecastLevel += forecastTrend;
    }

    return result;
  }
}

export {
  SeasonalNaiveModel,
  DriftModel,
  HoltWintersModel,
  SimpleNaiveModel,
  ForecastModel,
};
