import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class Locatins {

  private platformId = inject(PLATFORM_ID);

  // ===== STATE (Signals) =====
  lat = signal<number | null>(null);
  lng = signal<number | null>(null);
  accuracy = signal<number | null>(null);
  pincode = signal<string | null>(null);
  city = signal<string | null>(null)
  loading = signal(false);
  error = signal<string | null>(null);
  locationData = signal<any | []>([])

  constructor() {
    // 🔁 Auto reverse-geocode when lat/lng change
    effect(async () => {
      const lat = this.lat();
      const lng = this.lng();

      if (lat && lng) {
        console.log('this.reverseGeocode(lat, lng)', await this.reverseGeocode(lat, lng));
        
       this.locationData.set(await this.reverseGeocode(lat, lng));

       console.log('this.location', this.locationData());
       
      }
    });
  }

  // ===== GET LOCATION =====
  getCurrentLocation() {
    // ✅ SSR safe
    if (!isPlatformBrowser(this.platformId)) return;

    if (!('geolocation' in navigator)) {
      this.error.set('Geolocation not supported');
      return;
    }

    this.loading.set(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.lat.set(position.coords.latitude);
        this.lng.set(position.coords.longitude);
        this.accuracy.set(position.coords.accuracy);
        this.loading.set(false);
      },
      (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  // ===== REVERSE GEOCODING =====
  private async reverseGeocode(lat: number, lng: number) {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
  );

  const data = await res.json();
  console.log('datrrrrrr', data);
  
  return {
    area: data.locality || data.subLocality || '',
    city: data.city || data.principalSubdivision || '',
    state: data.principalSubdivision || '',
    pincode: data.postcode || '',
    country: data.countryName || ''
  };
}
}
