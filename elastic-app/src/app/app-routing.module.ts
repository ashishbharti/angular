import { AddCustomerComponent } from './customer/add-customer/add-customer.component';
import { ShowCustomersComponent } from './customer/show-customers/show-customers.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', redirectTo: 'flights', pathMatch: 'full' },
    { path: 'add', component: AddCustomerComponent },
    { path: 'flights', component: ShowCustomersComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
