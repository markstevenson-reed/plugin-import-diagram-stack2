import { Component } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import 'zone.js'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class App {
  diagram = '[Customer]<->[Address]->[office]->[test]'
}

bootstrapApplication(App)
