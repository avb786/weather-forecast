import { Component, OnInit } from '@angular/core';
import { LocationDetailsService } from '../../services/location-details.service';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public searchText: any = null;
  public bulkCities: any;
  public latitude: any;
  public longitude: any;
  public lsistOfWeatherDays: any;
  public singleDataStorage: any = {
    pressure: Number,
    humidity: Number
  };
  public chartSingleDataMax: any;
  public chartSingleDataWeatherMain: any;
  public days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  public sunrise: any;
  public sunset: Date;
  public options: any[] = [];
  public searchTextVal: any = true;

  constructor(
    private locationService: LocationDetailsService,
    private datePipe: DatePipe,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.getBulkCities();
  }

  getBulkCities(): void {
    this.locationService.getBulkCitiesDetails().subscribe((data): any => {
      this.bulkCities = data;
      this.getIpAddressOfParticularUser();
    }, error => {
      console.log('Error in Fetching data bulk', error);
    });
  }

  filterCity(searchText: string): void {
    if (searchText.length) {
      this.searchTextVal = true;
      this.options = [...this.bulkCities.filter(c => c.city.toLowerCase().indexOf(searchText.toLowerCase()) > -1)];
      this.options.forEach(option => {
        if (option && option.weather) { } else {
          this.locationService.getCurrentWeather(option.lat, option.lng).then(response => {
            option.temp = response.temp;
            option.weather = response.weather;
          });
        }
      });
    } else {
      this.options.length = 0;
    }
  }

  getIpAddressOfParticularUser(): void {
    if ('geolocation' in navigator) {
      // check if geolocation is supported/enabled on current browser
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          // for when getting location is a success
          console.log('latitude', position.coords.latitude,
            'longitude', position.coords.longitude);
          const getCity = this.bulkCities.find(city => city.lat === this.latitude && city.lng === this.longitude);
          if (getCity) {
            this.getParticularDays(position.coords.latitude, position.coords.longitude);
          } else {
            const mumbai = this.bulkCities.find(city => city.city === 'Mumbai');
            this.searchText = `${mumbai.city}, ${mumbai.admin}`;
            this.getParticularDays(mumbai.lat, mumbai.lng);
          }
        },
        (errorMessage) => {
          console.error('An error has occured while retrieving location', errorMessage);
        }
      );
    } else {
      console.log('geolocation is not enabled on this browser');
    }
  }

  getParticularDays(latitude, longitude): any {
    this.auth.enableLoader = true;
    this.locationService.getParticularDays(latitude, longitude).subscribe((data: any) => {
      this.lsistOfWeatherDays = data.daily;
      const finalData = this.lsistOfWeatherDays.map((value) => {
        value.dt = new Date(value.dt * 1000).getDay();
        value.dt = this.days[value.dt];
        value.temp.min = Math.round(value.temp.min);
        value.temp.max = Math.round(value.temp.max);
        return value;
      });
      this.chartSingleDataMax = this.lsistOfWeatherDays[0].temp.max;
      this.chartSingleDataWeatherMain = this.lsistOfWeatherDays[0].weather[0].main;
      this.singleDataStorage.pressure = this.lsistOfWeatherDays[0].pressure;
      this.singleDataStorage.humidity = this.lsistOfWeatherDays[0].humidity;
      this.sunrise = this.lsistOfWeatherDays[0].sunrise;
      this.sunset = this.lsistOfWeatherDays[0].sunset;
      this.auth.enableLoader = false;
    }, error => {

    });
  }

  showSingleData(singleData): void {
    this.singleDataStorage = singleData;
    this.chartSingleDataMax = singleData.temp.max;
    this.chartSingleDataWeatherMain = singleData.weather[0].main;
    const sunriseData = new Date(singleData.sunrise * 1000);
    const sunsetData = new Date(singleData.sunset * 1000);
    this.sunrise = sunriseData;
    this.sunset = sunsetData;
  }

  searchDataAvail(city): void {
    this.getParticularDays(city.lat, city.lng);
    this.searchTextVal = false;
    this.searchText = `${city.city}, ${city.admin}`;
  }

}
