import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../models/config';
@Injectable({
  providedIn: 'root'
})
export class LocationDetailsService {

  apiUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(
    private http: HttpClient
  ) { }

  getLocation() {
    const urlGet=  'http://ip-api.com/json';
    return this.http.get(urlGet);
  }
  getBulkCitiesDetails(): any {
    const urlGet = '/assets/data/in.json';
    return this.http.get(urlGet);
  }

  getParticularDays(latitude, longitude): any {
    const urlGet = `${this.apiUrl}/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&appid=${API_CONFIG.apiKey}&units=metric`;
    return this.http.get(urlGet);
  }

  getCurrentWeather(latitude, longitude): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const url = `${this.apiUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${API_CONFIG.apiKey}&units=metric`;
      let response;
      this.http.get(url).toPromise().then(res => {
        response = res;
        resolve({
          temp: response.main.temp,
          weather: response.weather[0].main
        });
      });
    });
  }

}
