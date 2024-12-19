import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { AddressModalComponent } from "../../address-modal/address-modal.component";
import { ConfirmationModalComponent } from "../../confirmation-modal/confirmation-modal.component";
import { CheckoutApiService } from "../../services/checkout-api.service";
import { Address } from "../../utils/address";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
    imports: [ReactiveFormsModule, CommonModule]
})

export class FormComponent implements OnInit {

  


  modalRef?: BsModalRef;
  checkoutForm: FormGroup;
  savedAddresses: Address[] = []; // Holds multiple addresses
  addresses: any[] = [];  // Type the addresses as an array of Address
  selectedAddress: Address | undefined;
  savedAddress: Address | null = null;  // Use the Address interface
  addressBoxOpen = false; // Controls the visibility of the saved addresses section
  uniqueCountries: string[] = [];
  selectedCountry: string = '';
  errorMessage: string = '';
  uniqueStates: string[] = [];
  countryStateMap: { [key: string]: string[] | undefined } = {};  // Initialize as an empty object

   openAddressModal(address: Address | null = null, isClickedFromEdit?: boolean): void {
    this.modalRef = this.modalService.show(AddressModalComponent, {
      class: 'modal-dialog-centered',
      initialState: {
        addressData: address || null, // Pass existing address if available,
        countryStateMap: this.countryStateMap,
        isEdit: isClickedFromEdit
      },
    });
    // Listen for the saveAddress event from the modal
     this.modalRef.content?.saveAddress.subscribe((address: any) => {
      isClickedFromEdit ? this.replaceAddress(address) : this.saveAddress(address);
      this.modalRef?.hide();
    });
  }

  openConfirmasionModal(address: Address): void {
    this.modalRef = this.modalService.show(ConfirmationModalComponent, {
      class: 'modal-dialog-centered',
    });

    // Listen for the user's response
    this.modalRef.content?.confirm.subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteAddress(address); // Handle address deletion
      }
    });
  }

  deleteAddress(addressToDelete: Address): void {
    this.checkoutApiService.deleteAddressById(addressToDelete.id).subscribe({
      next: (response) => {
        this.savedAddresses = this.savedAddresses.filter(
          (address) => address !== addressToDelete
        );
        console.log('Addresses saved successfully:', response);
      },
      error: (error) => {
        console.error('Error saving addresses:', error);
      }
    });
  }

  saveAddress(address: Address): void {
    this.checkoutApiService.postAddress(address).subscribe({
      next: (response) => {
        this.savedAddresses.push(response);
        console.log('Addresses saved successfully:', response);
      },
      error: (error) => {
        console.error('Error saving addresses:', error);
      }
    });
  }

  replaceAddress(addressToReplace: Address): void {
    this.checkoutApiService.replaceAddressById(addressToReplace.id, addressToReplace).subscribe({
      next: (response) => {
        const index = this.savedAddresses.findIndex((addr) => addr.id === addressToReplace.id);
        if (index !== -1) {
          this.savedAddresses[index] = addressToReplace; // Replace the address at the found index
        } else {
          console.warn('Address with the specified ID not found in savedAddresses.');
        }        console.log('Addresses saved successfully:', response);
      },
      error: (error) => {
        console.error('Error saving addresses:', error);
      }
    });
  }

  constructor(private modalService: BsModalService, private checkoutApiService: CheckoutApiService, private fb: FormBuilder) {
    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]], // Only letters
      lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],  // Only letters
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      ccName: ['', Validators.required],
      ccNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{16}$/)] // 16-digit card number
      ],
      ccExpiration: [
        '',
        [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/[0-9]{2}$/)] // MM/YY format
      ],
      ccCVV: ['', [Validators.required, Validators.pattern(/^[0-9]{3}$/)]], // 3-digit CVV
    });
    
  }

  ngOnInit() {
    this.getAddresses();
    this.getCountriesAndStates();
  }

  getAddresses() {
    this.checkoutApiService.getAddresses().subscribe({
      next: (response) => {
        this.savedAddresses = response;
      },
      error: (err: any) => {
        
      },
    });
  }

  // Fetch countries and states for each country
  getCountriesAndStates() {
    this.checkoutApiService.getCountries().subscribe({
      next: (countries: string[]) => {
        this.uniqueCountries = [...new Set(countries)];

        // For each country, fetch its states
        const countryStateRequests = this.uniqueCountries.map(country => 
          this.checkoutApiService.getStatesByCountry(country).toPromise()
        );

        // Wait for all states to be fetched for each country
        Promise.all(countryStateRequests).then((statesArray) => {
          statesArray.forEach((states, index) => {
            this.countryStateMap[this.uniqueCountries[index]] = states;
          });

          // Set the default country and states after fetching
          if (this.uniqueCountries.length > 0) {
            this.selectedCountry = this.uniqueCountries[0];
            this.uniqueStates = this.countryStateMap[this.selectedCountry] || [];
          }
        }).catch((err) => {
          this.errorMessage = 'Failed to fetch states for countries.';
          console.error('API Error:', err);
        });
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to fetch countries. Please try again later.';
        console.error('API Error:', err);
      }
    });
  }

  
  onSubmit() {
    if (this.checkoutForm.valid) {
      console.log('Form Submitted:', this.checkoutForm.value);
    } else {
      this.markFormGroupTouched(this.checkoutForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }
  
    // Generate unique ID for each address (you can use any other logic for generating IDs)
    private generateId(): string {
      return (Math.random() + 1).toString(36).substring(7); // Simple unique ID
    }

      // Toggle the visibility of the saved addresses section
  toggleAddressBox(): void {
    this.addressBoxOpen = !this.addressBoxOpen;
  }

  formatAddress(address: any): string {
    if (!address) return '';
    return [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.zipCode
    ]
      .filter(part => part) // Remove null or undefined values
      .join(', ');
  }

  selectedAddressId: string | null = null;

  selectAddress(address: any): void {
    // Select the clicked address
    this.savedAddresses.forEach(addressItem => {
      if(addressItem.id === address.id){
        addressItem.isSelected = true;
      } else {
        addressItem.isSelected = false;
      }
    });
    this.selectedAddress = address;
    this.selectedAddressId = address.id;
    this.toggleAddressBox();
  }

  setSelectedAddress(): Address | undefined {
    return (this.savedAddresses.find((address) => address.isSelected === true))
  }
}