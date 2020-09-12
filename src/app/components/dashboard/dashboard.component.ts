import { Component, OnInit, ViewChild } from '@angular/core';
import { LocationDetailsService } from '../../services/location-details.service';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import * as _ from 'lodash';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};
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
  public data: any;
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: any;
  public isHourlyDataLoaded = false;
  public listOfHourlyData: any;


  constructor(
    private locationService: LocationDetailsService,
    private datePipe: DatePipe,
    private auth: AuthService
  ) { }

  async ngOnInit() {
    await this.getBulkCities();
    await this.getGraphDetails();
  }

  getGraphDetails() {
    this.chartOptions = {
      chart: {
        height: 280,
        width: 800,
        type: 'area'
      },
      dataLabels: {
        enabled: false
      },
      grid: {
        borderColor: '#ebebeb',
        clipMarkers: false,
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: false
          }
        }
      },
      markers: {
        size: 5,
        colors: ['#fff'],
        strokeColor: '#00BAEC',
        strokeWidth: 2,
        hover: {
          size: 5,
          sizeOffset: 3,
          strokeColor: '#00BAEC'
        }
      },
      series: [
        {
          name: 'temp',
          data: []
        }
      ],
      colors: ['#00a6fa'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 70, 100]
        }
      },
      yaxis: {
        show: false
      },
      xaxis: {
        categories: []
      },
      stroke: {
        width: [2, 2]
      },
      tooltip: {
        followCursor: true,
        style: {
          fontSize: '14px',
          fontFamily: 'Roboto, sans-serif'
        },
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          return (
            `<div class="arrow_box">
      <span>${w.globals.categoryLabels[dataPointIndex]}</span>
      <br>
      <span class="temp">temp : ${series[seriesIndex][dataPointIndex]}</span>
      </div>`
          );
        }
      }
    }
  }
  getBulkCities() {
    this.locationService.getBulkCitiesDetails().subscribe((data) => {
      this.bulkCities = data;
      this.getIpAddressOfParticularUser();
    }, error => {
      console.log('Error in Fetching data bulk', error);
    });
  }

  filterCity(searchText: string): void {
    if (searchText.length) {
      this.searchTextVal = true;
      this.options = [...this.bulkCities.filter(c => c.city.toLowerCase().indexOf(searchText.toLowerCase()) > -1 || c.admin.toLowerCase().indexOf(searchText.toLowerCase()) > -1)];
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

  getIpAddressOfParticularUser() {
    if ("geolocation" in navigator) {
      // check if geolocation is supported/enabled on current browser
      navigator.geolocation.getCurrentPosition(async (position) => {
        // for when getting location is a success
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        await this.locationService.getCityName(this.latitude, this.longitude).subscribe((data: any) => {
          let locatedCity;
          locatedCity = this.bulkCities.find(city => city.city === data.results[0].components.city);
          if (locatedCity) {
            this.searchText = `${locatedCity.city}, ${locatedCity.admin}`;
            this.getParticularDays(locatedCity.lat, locatedCity.lng);
          } else {
            const mumbai = this.bulkCities.find(city => city.city === 'Mumbai');
            this.searchText = `${mumbai.city}, ${mumbai.admin}`;
            this.getParticularDays(mumbai.lat, mumbai.lng);
          }
        })
      },
        error_message => {
          // for when getting location results in an error
          console.error('An error has occured while retrieving ocation', error_message)
        });
    } else {
      // geolocation is not supported
      // get your location some other way
      console.log('geolocation is not enabled on this browser')
    }
  }

  getParticularHours(latitude, longitude) {
    this.locationService.getParticularDays(latitude, longitude).subscribe((data: any) => {
      const dataOfHours = data.hourly;
      const finalData = dataOfHours.map((value) => {
        value.dt = new Date(value.dt * 1000).getMinutes();
        value.dt = this.days[value.dt];
        return value;
      });
    }, error => {
      console.log('Error in gettimg hourly data', error);

    })
  }
  getParticularDays(latitude, longitude): any {
    this.auth.enableLoader = true;
    this.locationService.getParticularDays(latitude, longitude).subscribe((data: any) => {
      this.lsistOfWeatherDays = data.daily;
      this.listOfHourlyData = data.hourly;
      this.listOfHourlyData.forEach((d) => {
        if (new Date(data.daily[0].dt * 1000).getDate() === new Date(d.dt * 1000).getDate()) {
          this.chartOptions.xaxis.categories.push(this.datePipe.transform(new Date(d.dt * 1000), 'h a'));
          this.chartOptions.series[0].data.push(d.temp);
        }
      });
      this.isHourlyDataLoaded = true;
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
      console.error('Something went wrong', error)
    });
  }

  async showSingleData(singleData) {
    this.isHourlyDataLoaded = false;
    this.singleDataStorage = singleData;
    this.chartSingleDataMax = singleData.temp.max;
    this.chartSingleDataWeatherMain = singleData.weather[0].main;
    this.sunrise = new Date(singleData.sunrise * 1000);
    this.sunset = new Date(singleData.sunset * 1000);
    this.chartOptions.xaxis.categories.length = 0;
    this.chartOptions.series[0].data.length = 0;
    this.listOfHourlyData.forEach((data) => {
      if (singleData.dt === this.datePipe.transform(new Date(data.dt * 1000), 'EEEE')) {
        this.chartOptions.xaxis.categories.push(this.datePipe.transform(new Date(data.dt * 1000), 'h a'));
        this.chartOptions.series[0].data.push(data.temp);
      }
    });
    this.auth.enableLoader = true;
    await setTimeout(() => {
      this.isHourlyDataLoaded = true;
      this.auth.enableLoader = false;
    }, 3000);

  }

  searchDataAvail(city): void {
    this.locationService.getCityName(city.lat, city.lng).subscribe((response: any) => {
      this.getParticularDays(response.results[0].geometry.lat, response.results[0].geometry.lng);
      this.searchTextVal = false;
      this.searchText = `${response.results[0].components.city}, ${response.results[0].components.state}`;
    }, error => {
      console.error('Error on Search data', error);
    })

  }

}
