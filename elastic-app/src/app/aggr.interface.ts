export interface Order {
  _count: string;
}

export interface Terms {
    terms: {
        field: string;
        order: Order;
    };
}

export interface Aggregations {
   aggs: {
     [key: string]: Terms
   };
}
