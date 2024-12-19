export interface Address {
    id: string,
    addressLine1: string,
    addressLine2: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    saved: boolean
    isSelected?: boolean;
}