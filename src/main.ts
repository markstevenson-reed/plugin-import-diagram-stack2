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
  mainRawText: WritableSignal<string> = signal('')
  testRawText: WritableSignal<string> = signal(`[XmsWebapp]<-[XmsOrders]
  [XmsOrders]<-[XmsFulfilment]
  [XmsOrders]<-[XmsConfig]
  [XmsCore]<-[XmsRoles]
  [XmsLookup]<-[XmsCommon]
  [XmsRoles]<-[XmsLookup]
  [XmsRoles]<-[XmsSecurity]
  [XmsFulfilment]<-[XmsCore]
  [XmsConfig]<-[XmsCommonConfig]
  [XmsConfig]<-[XmsCore]`)
  diagram: WritableSignal<string> = signal('[Customer]<->[Address]->[office]->[test]')
  errors: WritableSignal<string[]> = signal([])

  clearMain() {
    this.mainRawText.set('')
  }

  submitMain() {
    this.process()
  }

  clearTest() {
    this.testRawText.set('')
  }

  submitTest() {
    let txt: string = this.testRawText()
    txt = txt.replaceAll('\n',', ')
    this.diagram.set(txt)
  }

  private process() {
    let txt: string = this.mainRawText()
    this.errors.set([])

    // do stuff
    // e.g. update txt with regex
    // e.g. set errors

    this.errors.set(['oopsie1', 'oopsie2'])

    if (!this.errors().length) {
      this.diagram.set(txt)
    }
  }
}

bootstrapApplication(App)
