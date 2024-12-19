import { Component } from '@angular/core';
import { FormComponent } from "../form/form.component";
import { CartComponent } from "../cart/cart.component";
import { AppHeaderComponent } from "../app-header/app-header.component";

@Component({
  selector: 'app-checkout',
  imports: [FormComponent, CartComponent, AppHeaderComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {

}
