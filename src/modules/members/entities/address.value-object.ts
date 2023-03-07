import { ValueObject } from '../../../common/ddd/value-object';

type AddressProps = {
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
  position: [lat: number, lng: number];
};

export class Address extends ValueObject<AddressProps> {
  get line1() {
    return this.value.line1;
  }

  get line2() {
    return this.value.line2;
  }

  get postalCode() {
    return this.value.postalCode;
  }

  get city() {
    return this.value.city;
  }

  get country() {
    return this.value.country;
  }

  get position() {
    return this.value.position;
  }
}
