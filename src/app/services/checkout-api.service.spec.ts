import { TestBed } from '@angular/core/testing';

import { CheckoutApiService } from './checkout-api.service';
import { HttpClient } from '@angular/common/http';

describe('CheckoutApiService', () => {
  let service: CheckoutApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CheckoutApiService]
    });
    service = TestBed.inject(CheckoutApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
