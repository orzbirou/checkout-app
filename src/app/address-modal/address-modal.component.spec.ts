import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddressModalComponent } from './address-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CheckoutApiService } from '../services/checkout-api.service';
import { of } from 'rxjs';

describe('AddressModalComponent', () => {
  let component: AddressModalComponent;
  let fixture: ComponentFixture<AddressModalComponent>;
  let mockBsModalRef: jasmine.SpyObj<BsModalRef>;
  let mockCheckoutApiService: jasmine.SpyObj<CheckoutApiService>;

  beforeEach(async () => {
    mockBsModalRef = jasmine.createSpyObj('BsModalRef', ['hide']);
    mockCheckoutApiService = jasmine.createSpyObj('CheckoutApiService', ['getCountries']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AddressModalComponent],
      providers: [
        { provide: BsModalRef, useValue: mockBsModalRef },
        { provide: CheckoutApiService, useValue: mockCheckoutApiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddressModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.addressForm).toBeDefined();
    expect(component.addressForm.valid).toBeFalsy();
  });

  it('should display "Add New Address" when isEdit is false', () => {
    component.isEdit = false;
    fixture.detectChanges();
    const modalTitle = fixture.nativeElement.querySelector('.modal-title');
    expect(modalTitle.textContent).toContain('Add New Address');
  });

  it('should display "Edit Address" when isEdit is true', () => {
    component.isEdit = true;
    fixture.detectChanges();
    const modalTitle = fixture.nativeElement.querySelector('.modal-title');
    expect(modalTitle.textContent).toContain('Edit Address');
  });

  it('should call onSaveAddress when form is valid', () => {
    component.addressForm.setValue({
      addressLine1: '123 Main St',
      addressLine2: 'Apt 4',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    });
    component.onSaveAddress();
    expect(mockBsModalRef.hide).toHaveBeenCalled();
    expect(component.saveAddress.emit).toHaveBeenCalledWith(component.addressForm.value);
  });

  it('should not call onSaveAddress if form is invalid', () => {
    component.addressForm.setValue({
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    });
    component.onSaveAddress();
    expect(mockBsModalRef.hide).not.toHaveBeenCalled();
    expect(component.saveAddress.emit).not.toHaveBeenCalled();
  });

  it('should handle country and state selection properly', () => {
    component.countryStateMap = {
      USA: ['NY', 'CA'],
      Canada: ['ON', 'BC']
    };
    component.ngOnInit();
    component.selectedCountry = 'USA';
    component.updateStates('USA');
    expect(component.uniqueStates.length).toBe(2);
    expect(component.uniqueStates).toEqual(['NY', 'CA']);
  });

  it('should disable state field if no states are available for the selected country', () => {
    component.countryStateMap = {
      USA: [],
      Canada: []
    };
    component.ngOnInit();
    component.selectedCountry = 'USA';
    component.updateStates('USA');
    const stateControl = component.addressForm.get('state');
    expect(stateControl?.disabled).toBeTruthy();
  });

  it('should call onClose when modal close button is clicked', () => {
    const closeButton = fixture.nativeElement.querySelector('button.btn-close');
    closeButton.click();
    expect(mockBsModalRef.hide).toHaveBeenCalled();
  });

  it('should show validation errors when form is invalid and submit is clicked', () => {
    component.addressForm.setValue({
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    });
    const saveButton = fixture.nativeElement.querySelector('button[type="submit"]');
    saveButton.click();
    fixture.detectChanges();
    const errorMessages = fixture.nativeElement.querySelectorAll('.text-danger');
    expect(errorMessages.length).toBeGreaterThan(0);  // There should be validation error messages
  });

  it('should set unique countries from countryStateMap on initialization', () => {
    component.countryStateMap = {
      USA: ['NY', 'CA'],
      Canada: ['ON', 'BC']
    };
    component.ngOnInit();
    expect(component.uniqueCountries).toEqual(['USA', 'Canada']);
  });

});
