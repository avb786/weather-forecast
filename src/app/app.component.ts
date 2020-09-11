import { Component } from '@angular/core';
import { AuthService } from "./services/auth.service";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'weather-forecast';
  elementsArray = ['Data fetching....','Preparing Your Location.. ', 'Loading your weather...', 'Finding the Weather Forecast report...', 'Analyzing the Forecast Data...', 'Humidity and Pressue Level fetching...'];
  data: any;
  index = 0;
  constructor(public auth: AuthService) {
    setInterval(() => {
      this.increaseMsg(this.index);
      this.index++;
    }, 900);
  }
  
  increaseMsg(i) {
    this.data = this.elementsArray[i];
    if (this.index === this.elementsArray.length) {
        this.index = 0;
    }
  }

}
