export type OrderBy = {
  fieldOrSelection: string;
  order: Order;
  nulls?: Nulls;
}

export type Order = 'desc' | 'asc';

export type Nulls = 'first' | 'last';