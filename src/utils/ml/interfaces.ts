interface DataPoint {
  idx_year: string;
  idx_unit: string;
  idx_value: string;
}

interface Dataset {
  idx_item: string;
  idx_item_data: {
    contents: DataPoint[];
  };
}

export type { DataPoint, Dataset };
