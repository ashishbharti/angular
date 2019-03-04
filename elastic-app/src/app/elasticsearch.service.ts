import { Injectable } from '@angular/core';
import { Client } from 'elasticsearch-browser';
import * as elasticsearch from 'elasticsearch-browser';
/*import { Aggregations } from './aggr.interface';*/

@Injectable({
    providedIn: 'root'
})
export class ElasticsearchService {

    private client: elasticsearch.Client;

    attributes = ['OriginWeather', 'OriginCityName', 'DestCountry',  'Carrier', 'DestCityName', 'FlightDelay', 'FlightDelayType'];
    aggrs = {};


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
    aggrBuilder(): any {
        this.attributes.map((e) => { this.aggrs[e] = { 'terms': { 'field': e, 'order': { '_count': 'desc' } } } });
    }
    getAllDocumentsWithScroll(_index, _type, _size): any {
        this.aggrBuilder();
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
                'aggs': this.aggrs
            }
        });
    }

    fullTextSearch(_index, _type, _field, _queryText): any {
        this.aggrBuilder();
        return this.client.search({
            index: _index,
            type: _type,
            filterPath: ['hits.hits._source', 'hits.total', '_scroll_id', 'aggregations'],
            body: {
                'query': {
                    'simple_query_string': {
                        'fields': _field,
                        'query': _queryText
                        // [_field]: _queryText
                    }
                },
                'aggs': this.aggrs
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

