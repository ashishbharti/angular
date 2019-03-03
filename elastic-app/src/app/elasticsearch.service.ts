import { Injectable } from '@angular/core';
import { Client } from 'elasticsearch-browser';
import * as elasticsearch from 'elasticsearch-browser';

@Injectable({
  providedIn: 'root'
})
export class ElasticsearchService {

  private client: elasticsearch.Client;

  private queryalldocs = {
    'query': {
      'match_all': {}
    }
  };

  constructor() {
    if (!this.client) {
      this.connect();
    }
  }

  private connect() {
    this.client = new elasticsearch.Client({
      host: 'http://localhost:9200',
      log: 'trace'
    });
  }

  isAvailable(): any {
    return this.client.ping({
      requestTimeout: Infinity,
      body: 'hello ashish!'
    });
  }

  addToIndex(value): any {
    return this.client.create(value);
  }

  getAllDocuments(_index, _type): any {
    return this.client.search({
      index: _index,
      type: _type,
      body: this.queryalldocs,
      filterPath: ['hits.hits._source']
    });
  }

  getAllDocumentsWithScroll(_index, _type, _size): any {
    return this.client.search({
      index: _index,
      type: _type,
      scroll: '1m',
      filterPath: ['hits.hits._source', 'hits.total', '_scroll_id', 'aggregations'],
      body: {
        'size': _size,
        'query': {
          'match_all': {}
        },
        'sort': [
          { '_uid': { 'order': 'asc' } }
        ],
        'aggs': {
          'DestCountry' : {
            'terms' : { 'field' : 'DestCountry' , 'order' : { '_count' : 'desc' }}
          },
        'OriginWeather' : {
            'terms' : { 'field' : 'OriginWeather' , 'order' : { '_count' : 'desc' }}
        }
    }
      }
    });
  }

  fullTextSearch(_index, _type, _field, _queryText): any {
    return this.client.search({
      index: _index,
      type: _type,
      filterPath: ['hits.hits._source', 'hits.total', '_scroll_id', 'aggregations'],
      body: {
        'query': {
          'simple_query_string': {
            'fields' : _field,
            'query' : _queryText
           // [_field]: _queryText
          }
        },
        'aggs': {
          'DestCountry' : {
            'terms' : { 'field' : 'DestCountry' , 'order' : { '_count' : 'desc' }}
          },
        'OriginWeather' : {
            'terms' : { 'field' : 'OriginWeather' , 'order' : { '_count' : 'desc' }}
        }
    }
      },
      // '_source': ['FlightNum']
    });
  }
  getNextPage(scroll_id): any {
    return this.client.scroll({
      scrollId: scroll_id,
      scroll: '1m',
      filterPath: ['hits.hits._source', 'hits.total', '_scroll_id']
    });
  }
}
