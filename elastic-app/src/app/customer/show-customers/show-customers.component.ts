import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FlightSource } from '../flight.interface';
import { ElasticsearchService } from '../../elasticsearch.service';
import { MustQuery, Terms } from '../query.interface';
import { MatPaginator } from '@angular/material';

@Component({
    selector: 'app-show-customers',
    templateUrl: './show-customers.component.html',
    styleUrls: ['./show-customers.component.css']
})
export class ShowCustomersComponent implements OnInit {

    private static readonly INDEX = 'kibana_sample_data_flights';
    private static readonly TYPE = '_doc';
    @ViewChild(MatPaginator) paginator: MatPaginator;

    pageSize = 10;
    pageIndex = 0;
    previousPageIndex = 0;

    pageSizeOptions: number[] = [5, 10, 25, 100];
    customerSources: FlightSource[];
    haveNextPage = false;
    scrollID = '';
    notice = '';

    Fields = ['FlightNum', 'DestCountry'];

    aggrs: any;

    total: number;

    progressbar: Boolean = true;
    queryText = '';

    private lastKeypress = 0;

    selectedOptions: string[] = [];

    obj: MustQuery;

    tr: any = [];

    constructor(public es: ElasticsearchService) {
        this.scrollID = '';
        this.notice = '';
        this.haveNextPage = false;
        this.queryText = '';
    }


    ngOnInit() {
        this.queryText = '';
        this.tr = [];
        this.es.getAllDocumentsWithScroll(
            ShowCustomersComponent.INDEX,
            ShowCustomersComponent.TYPE,
            this.pageIndex, this.pageSize).then(
                response => {
                    this.progressbar = false;
                    this.customerSources = response.hits.hits;
                    this.aggrs = response.aggregations;
                    this.total = response.hits.total;
                    console.log(response);
                }, error => {
                    console.error(error);
                }).then(() => {
                    console.log('Show Customer Completed!');
                });
    }

    // tslint:disable-next-line:use-life-cycle-interface
    pageEvent(event) {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        console.log(' queryText :' + this.queryText);
        if (typeof this.queryText !== 'undefined' && this.queryText) {
            this.es.fullTextSearch(
                ShowCustomersComponent.INDEX,
                ShowCustomersComponent.TYPE,
                this.Fields, this.queryText, this.pageIndex, this.pageSize).then(
                    response => {
                        this.customerSources = response.hits.hits;
                        this.aggrs = response.aggregations;
                        this.total = response.hits.total;
                        console.log(response);
                    }, error => {
                        console.error(error);
                    }).then(() => {
                        console.log('Search Completed!');
                    });
        } else {
            if (typeof this.obj === 'undefined') {
                this.es.getAllDocumentsWithScroll(
                    ShowCustomersComponent.INDEX,
                    ShowCustomersComponent.TYPE,
                    this.pageIndex, this.pageSize).then(
                        response => {
                            this.progressbar = false;
                            this.customerSources = response.hits.hits;
                            this.aggrs = response.aggregations;
                            this.total = response.hits.total;
                            console.log(response);
                        }, error => {
                            console.error(error);
                        }).then(() => {
                            console.log('Show Customer Completed!');
                        });
            } else {
                this.es.filterPaginationSearch(ShowCustomersComponent.INDEX,
                    ShowCustomersComponent.TYPE,
                    this.obj.query, this.pageIndex, this.pageSize).then(
                        response => {
                            this.total = response.hits.total;
                            this.customerSources = response.hits.hits;
                            this.aggrs = response.aggregations;
                            if (response.hits.hits.length < response.hits.total) {
                                this.haveNextPage = true;
                                this.scrollID = response._scroll_id;
                            }
                            console.log(response);
                        }, error => {
                            console.error(error);
                        }).then(() => {
                            console.log('Filter Completed! ' + JSON.stringify(this.tr));
                        });
            }
        }
    }


    showNextPage() {
        this.es.getNextPage(this.scrollID).then(
            response => {
                this.customerSources = response.hits.hits;
                if (!response.hits.hits) {
                    this.haveNextPage = false;
                    this.notice = 'There are no more Results!';
                }
                console.log(response);
            }, error => {
                console.error(error);
            }).then(() => {
                console.log('Show Customer Completed!');
            });
    }
    search($event) {
        this.tr = [];
        this.paginator.pageIndex = 0;
        if ($event.timeStamp - this.lastKeypress > 100) {
            this.queryText = $event.target.value;

            this.es.fullTextSearch(
                ShowCustomersComponent.INDEX,
                ShowCustomersComponent.TYPE,
                this.Fields, this.queryText, this.pageIndex, this.pageSize).then(
                    response => {
                        this.customerSources = response.hits.hits;
                        this.aggrs = response.aggregations;
                        this.total = response.hits.total;
                        if (response.hits.hits.length < response.hits.total) {
                            this.haveNextPage = true;
                            this.scrollID = response._scroll_id;
                        }
                        console.log(response);
                    }, error => {
                        console.error(error);
                    }).then(() => {
                        console.log('Search Completed!');
                    });
        }

        this.lastKeypress = $event.timeStamp;
    }
    onSelectedOptionsChange(_cat, _event) {
        const tc = _event.map(s => s.value);
        const terms1: Terms = {
            'terms': {
                [_cat]: tc,
            }
        };

        this.tr.push(terms1);

        this.obj = {
            'query': {
                'bool': {
                    'filter': this.tr
                }
            }
        };
        this.paginator.pageIndex = 0;
        this.es.filterSearch(ShowCustomersComponent.INDEX,
            ShowCustomersComponent.TYPE,
            this.Fields, this.obj.query).then(
                response => {
                    this.total = response.hits.total;
                    this.customerSources = response.hits.hits;
                    this.aggrs = response.aggregations;
                    if (response.hits.hits.length < response.hits.total) {
                        this.haveNextPage = true;
                        this.scrollID = response._scroll_id;
                    }
                    console.log(response);
                }, error => {
                    console.error(error);
                }).then(() => {
                    console.log('Filter Completed! ' + JSON.stringify(this.tr));
                });


        /*onSelectedOptionsChange(_cat, _event) {
            this.tc[_cat] = _event.map(s => s.value);
            console.log(JSON.stringify(this.tc));
            const tempArr: string[] = [];
            for (const Ent of _event) {
               tempArr.push(Ent.value);
             }
            const terms1: Terms = {
                'terms' : {
                  [_cat] : tempArr,
                }
              };
             this.obj =  { 'query': {
            'bool': {
            'filter': [ terms1 ]
              }
            }
        };
        this.es.filterSearch(ShowCustomersComponent.INDEX,
              ShowCustomersComponent.TYPE,
              this.Fields, this.obj.query).then(
                response => {
                  this.customerSources = response.hits.hits;
                  this.aggrs = response.aggregations;
                  this.total = response.hits.total;
                  console.log(response);
                }, error => {
                  console.error(error);
                }).then(() => {
                  console.log('Filter Completed!');
                }); */
    }

}
