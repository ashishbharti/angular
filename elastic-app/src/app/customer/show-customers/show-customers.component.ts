import { Component, OnInit } from '@angular/core';
import { FlightSource } from '../flight.interface';
import { ElasticsearchService } from '../../elasticsearch.service';

@Component({
  selector: 'app-show-customers',
  templateUrl: './show-customers.component.html',
  styleUrls: ['./show-customers.component.css']
})
export class ShowCustomersComponent implements OnInit {

  private static readonly INDEX = 'kibana_sample_data_flights';
  private static readonly TYPE = '_doc';
  private static readonly SIZE = 10;

  customerSources: FlightSource[];
  haveNextPage = false;
  scrollID = '';
  notice = '';

  Fields = ['FlightNum', 'DestCountry'];

  aggrs: any;

  total: number;

  progressbar: Boolean = true;
  private queryText = '';

  private lastKeypress = 0

  constructor(private es: ElasticsearchService) {
    this.scrollID = '';
    this.notice = '';
    this.haveNextPage = false;
    this.queryText = '';
  }

  ngOnInit() {
    this.es.getAllDocumentsWithScroll(
      ShowCustomersComponent.INDEX,
      ShowCustomersComponent.TYPE,
      ShowCustomersComponent.SIZE).then(
        response => {
          this.progressbar =  false;
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
          console.log('Show Customer Completed!');
        });
  }

  showNextPage() {
    this.es.getNextPage(this.scrollID).then(
      response => {
        this.customerSources = response.hits.hits;
        if (!response.hits.hits) {
          this.haveNextPage = false;
          this.notice = 'There are no more Customers!';
        }
        console.log(response);
      }, error => {
        console.error(error);
      }).then(() => {
        console.log('Show Customer Completed!');
      });
  }
  search($event) {
    if ($event.timeStamp - this.lastKeypress > 100) {
      this.queryText = $event.target.value;

      this.es.fullTextSearch(
        ShowCustomersComponent.INDEX,
        ShowCustomersComponent.TYPE,
        this.Fields, this.queryText).then(
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
    }

    this.lastKeypress = $event.timeStamp;
  }
}
