import { CommonModule } from '@angular/common'
import { Component, signal, WritableSignal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { bootstrapApplication } from '@angular/platform-browser'
import 'zone.js'
import { UmlFormatter } from './UmlFormatter'
import { RawFormatter } from './RawFormatter'

// Starting example of raw data
const rawTextDefault: string = `
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
  `
  const javaScriptTextDefault: string = ``

  // Diagram default design
  const diagramDefault: string = '[Customer]<->[Address]->[office]->[test]'

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
  rawText: WritableSignal<string> = signal(rawTextDefault)
  umlText: WritableSignal<string> = signal(UmlFormatter.umlTextDefault)
  typeScriptText: WritableSignal<string> = signal('')
  diagram: WritableSignal<string> = signal(diagramDefault)

  errors: WritableSignal<string[]> = signal([])

  clearRaw() {
    this.rawText.set('')
  }

  //Format the raw contents into UML
  formatRawToUML() {
    this.process()
  }

  clearUml() {
    this.umlText.set('')
  }

  clearTypeScript() {
    this.typeScriptText.set('')
  }

  cleanUml() {
    const dependenciesByPlugin = UmlFormatter.createDependenciesByPlugin( this.umlText() )
    let umlCleanArr: string[] = []

    dependenciesByPlugin.forEach((dependencies,plugin) => {
      dependencies.forEach((dependency)=>{
        if(!UmlFormatter.isDependancyRedundant(dependenciesByPlugin, plugin, dependency)){
          umlCleanArr.push( `[${plugin}]<-[${dependency}]`)
        }
      })
    })
    umlCleanArr.sort()
    this.umlText.set(umlCleanArr.join('\n'))
  }

  formatUmlToTypeScript() {
    const dependenciesByPlugin = UmlFormatter.createDependenciesByPlugin( this.umlText() )
    let typeScriptArr: string[] = []

    dependenciesByPlugin.forEach((dependencies,plugin) => {
      typeScriptArr.push( `'${plugin}': {`)

      dependencies.forEach((dependency)=>{
        typeScriptArr.push(`\t'${dependency}', ${UmlFormatter.isDependancyRedundant(dependenciesByPlugin, plugin, dependency) ? '// Remove this':''}`)
      })
      typeScriptArr.push( `},`)
      
    })
    this.typeScriptText.set(typeScriptArr.join('\n'))
  }

  drawUml() {
    let txt: string = this.umlText()
    txt = txt.replaceAll('\n',', ')
    this.diagram.set(txt)
  }

  reset() {
    this.rawText.set(rawTextDefault)
    this.umlText.set(UmlFormatter.umlTextDefault)
    this.diagram.set(diagramDefault)
    this.errors.set([])
  }

  //Format the raw contents into UML
  private process() {
    //test
    let txt: string = this.rawText()
    let txtArr: string[] = txt.split('\n')
    let umlArr: string[] = RawFormatter.format(txtArr)

    this.errors.set([])

    // do stuff
    // e.g. update txt with regex
    // e.g. set errors
    if(!umlArr.length){
      this.errors.set(['UML lines are empty. Likely unable to find first line'])
      console.log(txtArr)
    }

    if (!this.errors().length) {
      //set the text back
      this.umlText.set(umlArr.join('\n'))
    }
  }
}

bootstrapApplication(App)
