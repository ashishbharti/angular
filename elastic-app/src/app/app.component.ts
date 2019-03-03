import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  navLinks: any[] = [
        {
            label: 'Flights',
            link: './flights',
            index: 1
        },
        {
            label: 'Add',
            link: './add',
            index: 0
        }
    ];
  activeLinkIndex = -1;
  title = 'Ashish ';
  description = 'Angular - Elasticsearch';


// tslint:disable-next-line:use-life-cycle-interface


}

