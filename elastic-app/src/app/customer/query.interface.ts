export interface Terms {
    'terms': {
        [key: string]: string[];
      };
}

export interface MustQuery {
    'query': {
        'bool': {
            'filter': Terms[];
        }
    };
}

