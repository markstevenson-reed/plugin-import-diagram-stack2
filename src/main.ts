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
  errors: WritableSignal<string[]> = signal([])

  clear() {
    this.rawText.set('')
  }

  submit() {
    this.process()
  }

  private process() {
    this.errors.set(['oopsie1', 'oopsie2'])
  }
}

bootstrapApplication(App)
