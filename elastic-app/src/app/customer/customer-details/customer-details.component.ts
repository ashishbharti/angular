import { Component, OnInit, Input } from '@angular/core';
import { Flights } from './../flight.interface';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.css']
})
export class CustomerDetailsComponent implements OnInit {

  @Input() customer: Flights;

  constructor() { }

  ngOnInit() {
  }

}
