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
  projectName: string = 'xms-platform-g3'
  exclusionLine: string = 'Occurrence in Gradle build script'
  rawText: WritableSignal<string> = signal(`
  Targets
    Occurrences of 'compile project(':' in Project
Found Occurrences  (268 usages found)
    (excluded) Unclassified occurrence  (1 usage found)
        (excluded) xms-platform-g3.XmsAuthorisation.main  (1 usage found)
            (excluded) com.xms.core.auth  (1 usage found)
                (excluded) AuthorisationService.groovy  (1 usage found)
                    (excluded) 1232 * the XmsAuthorisation/build.grade has the dependency compile project(':XmsCore') needs investigation.
    Occurrence in Gradle build script  (267 usages found)
        xms-platform-g3.XmsAccounts  (4 usages found)
            XmsAccounts  (4 usages found)
                build.gradle  (4 usages found)
                    89 compile project(':XmsCommon')
                    90 compile project(':XmsCommonConfig')
                    91 compile project(':XmsLookup')
                    92 compile project(':XmsCore')
        xms-platform-g3.XmsActivityCentre  (4 usages found)
            XmsActivityCentre  (4 usages found)
                build.gradle  (4 usages found)
                    92 compile project(':XmsCommon')
                    93 compile project(':XmsCommonConfig')
                    94 compile project(':XmsSecurity')
                    95 compile project(':XmsLookup')
  `)
  umlText: WritableSignal<string> = signal(`[XmsWebapp]<-[XmsOrders]
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

  clearRaw() {
    this.rawText.set('')
  }

  submitRaw() {
    this.process()
  }

  clearUml() {
    this.umlText.set('')
  }

  submitUml() {
    let txt: string = this.umlText()
    txt = txt.replaceAll('\n',', ')
    this.diagram.set(txt)
  }

  private process() {
    let txt: string = this.rawText()
    let exclusionLine: string = this.exclusionLine
    let txtArr: string[] = txt.split('\n')
    let found: boolean = false
    let umlArr: string[] = [];

    function cleanMe(input: string): string {
      input = input.replace(/        xms-platform-g3\..*/gi, '')
      input = input.replace(/                    \d{2,3} compile project/gi, '')
      input = input.replace(/                build.gradle  .*/gi, '')
      input = input.replace(/  \(\d{1,2} usage.* found\)/gi, ']')
      input = input.replace(/            /gi, '[')
      input = input.replace(/\(':/gi, '[todo]<-[')
      input = input.replace(/'\)/gi, ']')
      return input
    }

    this.errors.set([])

    txtArr.forEach(function(value){
    
      //if line has exclusionLine start from here    
      if(found){
        umlArr.push(cleanMe(value))
      }

      //Check for exlcusion line
      found = found ? true : value.includes(exclusionLine)
    })

    this.umlText.set(umlArr.join('\n'))



    // do stuff
    // e.g. update txt with regex
    // e.g. set errors
    
    this.errors.set(['oopsie1', 'oopsie2'])

    if (!this.errors().length) {
      //set the text back
      this.diagram.set(txt)
    }
  }
}

bootstrapApplication(App)
