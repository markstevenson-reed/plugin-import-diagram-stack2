import { CommonModule } from '@angular/common'
import { Component, signal, WritableSignal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { bootstrapApplication } from '@angular/platform-browser'
import 'zone.js'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class App {
  rawText: WritableSignal<string> = signal('')
  diagram: WritableSignal<string> = signal('[Customer]<->[Address]->[office]->[test]')

  clear() {
    alert('clear')
  }

  submit() {
    alert('submit')
  }
}

bootstrapApplication(App)
