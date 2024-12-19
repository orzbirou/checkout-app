import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AddressPart } from '../enums/address-part';
import { Address } from '../utils/address';

@Injectable({
  providedIn: 'root'
})
export class CheckoutApiService {

  private apiUrl = 'https://du-mock-checkout-7d42d0a76fbf.herokuapp.com/api/Address';
  private token = 'C4D5C577E9914C4B9C9BF46DF9914A28';

  constructor(private http: HttpClient) {}

  private get headers() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
  }

  /** Generic GET request to fetch address parts */
  getAddressPartFromApi(addressPart: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${addressPart}`, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }

  /** Generic POST request to send address data */
  postAddressToApi(addressPart: string, address: Address): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${addressPart}`, address, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }

  /** Fetch all addresses */
  getAddresses(): Observable<Address[]> {
    return this.getAddressPartFromApi('');
  }

  /** Send addresses to the API */
  postAddress(address: Address): Observable<any> {
    return this.postAddressToApi('', address);
  }

  /** Fetch countries */
  getCountries(): Observable<string[]> {
    return this.getAddressPartFromApi(AddressPart.COUNTRIES);
  }

  /** Fetch states */
  getStates(): Observable<any[]> {
    return this.getAddressPartFromApi(AddressPart.STATES);
  }

  /** Fetch states filtered by country */
  getStatesByCountry(country: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${AddressPart.STATES}/${country}`, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteAddressById(id: string): Observable<any> {
    return this.http.delete<any[]>(`${this.apiUrl}/${id}`, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }

  replaceAddressById(id: string, newAddress: Address): Observable<any> {
    return this.http.patch<any[]>(`${this.apiUrl}/${id}`, newAddress, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }

  /** Error handler */
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong with the API. Please try again later.'));
  }
}
