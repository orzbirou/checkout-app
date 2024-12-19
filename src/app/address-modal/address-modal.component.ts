import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CheckoutApiService } from "../services/checkout-api.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-address-modal',
  templateUrl: './address-modal.component.html',
  styleUrls: ['./address-modal.component.css'],
  imports: [ReactiveFormsModule, CommonModule]

})
export class AddressModalComponent implements OnInit {
  @Input() isEdit = false;
  @Input() addressData: any; // Accept address data from the parent component
  @Input() countryStateMap: any; // Map of countries and their states

  uniqueCountries: string[] = [];  // Array of country names
  uniqueStates: string[] = [];  // Array of state names
  errorMessage: string | null = null;

  @Output() saveAddress = new EventEmitter<any>();

  addressForm: FormGroup;
  private _selectedCountry = '';
  
  // Getter & Setter 
  get selectedCountry() {
    return this._selectedCountry;
  }

  set selectedCountry(event: any) {
    this._selectedCountry = event;
    this.updateStates(event);  // Update states when the country is changed
  }

  constructor(private fb: FormBuilder, public bsModalRef: BsModalRef, private checkoutApiService: CheckoutApiService) {
    this.addressForm = this.fb.group({
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      country: ['', Validators.required]  // Ensure country is selected in the form
    });
  }

  ngOnInit(): void {
    if (this.countryStateMap) {
      this.uniqueCountries = Object.keys(this.countryStateMap);  // Set unique countries from the map
    }

    if (this.addressData) {
      this.addressForm.patchValue(this.addressData); // Populate form with existing data
      this.selectedCountry = this.addressData?.country;
      this.updateStates(this.selectedCountry);  // Set initial states for the default country
    } else{
          // Set the initial selected country and its states
    if (this.uniqueCountries.length > 0) {
      this.selectedCountry = this.uniqueCountries[0];
      const countryControl = this.addressForm.get('country');
      countryControl?.setValue(this.uniqueCountries[0]);  // Set the default state if available
      this.updateStates(this.selectedCountry);  // Set initial states for the default country
    }
    }
  }

  updateStates(country: string): void {
    // Set uniqueStates based on the selected country from the countryStateMap
    this.uniqueStates = this.countryStateMap[country] || [];

    // Enable or disable the state field based on whether states are available
    const stateControl = this.addressForm.get('state');
    if (this.uniqueStates.length > 0) {
      stateControl?.enable();  // Enable state field if states are available
      stateControl?.setValue(this.uniqueStates[0]);  // Set the default state if available
    } else {
      stateControl?.disable();  // Disable state field if no states available
    }
  }

  onSaveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched(); // Mark all fields as touched to display errors
      return;
    }
    if (this.addressForm.valid) {
      let savedAddress = this.addressForm.value;
      if (this.isEdit) {
        savedAddress = {
          ...savedAddress,
          id: this.addressData.id,  // Keep the existing ID when editing
          saved: this.addressData.saved,
          isSelected: this.addressData.isSelected
        };
      } else {
        savedAddress = {
          ...savedAddress,
          saved: true,
        };
      }
      this.saveAddress.emit(savedAddress); // Emit the address data
      this.bsModalRef.hide(); // Close the modal
    } else {
      console.error('Form is invalid!');
    }
  }

  onClose(): void {
    this.bsModalRef.hide(); // Close the modal without saving
  }

  onCountryChange(event: any): void {
    this.selectedCountry = event.target.value;
    this.updateStates(this.selectedCountry);  // Update states for the selected country
  }
}
