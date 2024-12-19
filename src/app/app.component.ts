import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CheckoutComponent } from "./components/checkout/checkout.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CheckoutComponent, ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'checkout-app';
}
