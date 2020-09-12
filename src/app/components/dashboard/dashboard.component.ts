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
  ApexDataLabels,
  ApexYAxis,
  ApexLegend,
  ApexFill,
  ApexMarkers,
  ApexTitleSubtitle,
  ApexTooltip
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  legend: ApexLegend;
  fill: ApexFill;
  markers: ApexMarkers;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
};
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent;

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
  public sunset: any;
  public options: any[] = [];
  public searchTextVal: any = true;
  public data: any;
  public chartOptions: any;
  public chartOptions2: any;
  public isHourlyDataLoaded = false;
  public listOfHourlyData: any;
  public showSecondChart: any;
  constructor(
    private locationService: LocationDetailsService,
    private datePipe: DatePipe,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.getBulkCities();
    this.getGraphDetails();
    this.getSunGraphDetails();
  }

  getGraphDetails() {
    this.chartOptions = {
      chart: {
        height: 280,
        width: 1500,
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

  getSunGraphDetails() {
    this.chartOptions2 = {
      chart: {
        height: 200,
        type: 'area',
        toolbar: {
          show: false
        },
      },
      dataLabels: {
        enabled: false
      },
      grid: {
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: false
          }
        }
      },
      markers: {
        show: false
      },
      series: [
        {
          data: []
        }
      ],
      colors: ['#fedd4b'],
      fill: {
        type: 'solid',
        color: ['#fdf9f1']
      },
      yaxis: {
        show: false
      },
      xaxis: {
        categories: [],
        min: '5:00 AM',
        max: '7:00 PM'
      },
      stroke: {
        width: [2, 2]
      },
      tooltip: {
        enabled: false
      }
    };
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
        this.locationService.getCityName(this.latitude, this.longitude).subscribe((data: any) => {
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
          console.error('An error has occured while retrieving ocation', error_message)
        });
    } else {
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
      this.sunrise = new Date(this.lsistOfWeatherDays[0].sunrise * 1000);
      this.sunset = new Date(this.lsistOfWeatherDays[0].sunset * 1000);
      this.setSunsetAndSunrise(this.sunrise, this.sunset);
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
    this.setSunsetAndSunrise(this.sunrise, this.sunset);
    setTimeout(() => {
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

  setSunsetAndSunrise(sunrise, sunset): void {
    this.showSecondChart = false;
    this.chartOptions2.series[0].data.length = 0;
    this.chartOptions2.series[0].data.push({
      x: this.datePipe.transform(new Date(sunrise), 'shortTime'), y: 0
    });
    this.chartOptions2.series[0].data.push({
      x: '3:00 PM', y: 1
    });
    this.chartOptions2.series[0].data.push({
      x: this.datePipe.transform(new Date(sunset), 'shortTime'), y: 0
    });
    this.auth.enableLoader = true;
    setTimeout(() => {
      this.showSecondChart = true;
      this.auth.enableLoader = false;
    }, 3000);
  }

  focusOnSearchBox() {
    document.getElementById("searchBox").focus();
  }

}
