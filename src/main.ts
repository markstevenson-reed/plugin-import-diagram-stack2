import { CommonModule } from '@angular/common'
import { Component, signal, WritableSignal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { bootstrapApplication } from '@angular/platform-browser'
import 'zone.js'

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
  // Starting example of uml text data
  const umlTextDefault: string = `[XmsWebapp]<-[XmsOrders]
  [XmsOrders]<-[XmsFulfilment]
  [XmsOrders]<-[XmsConfig]
  [XmsCore]<-[XmsRoles]
  [XmsLookup]<-[XmsCommon]
  [XmsRoles]<-[XmsLookup]
  [XmsRoles]<-[XmsSecurity]
  [XmsFulfilment]<-[XmsCore]
  [XmsConfig]<-[XmsCommonConfig]
  [XmsConfig]<-[XmsRoles]
  [XmsConfig]<-[XmsCore]`

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
  projectName: string = 'xms-platform-g3'
  exclusionLine: string = 'Occurrence in Gradle build script'
  rawText: WritableSignal<string> = signal(rawTextDefault)
  umlText: WritableSignal<string> = signal(umlTextDefault)
  javaScriptText: WritableSignal<string> = signal('')
  diagram: WritableSignal<string> = signal(diagramDefault)

  errors: WritableSignal<string[]> = signal([])

  clearRaw() {
    this.rawText.set('')
  }

  //Format the raw contents into UML
  formatRaw() {
    this.process()
  }

  clearUml() {
    this.umlText.set('')
  }

  cleanUml() {
    // Define the dependencies
    const dependencies: { [key: string]: string[] } = {
      A: ['B', 'C'],
      B: ['C'],
      C: []
    }

    const start = 'A'
    const target = 'C'
    const redundant = this.isRedundant(dependencies, start, target)
    // Regular expression to match content inside square brackets
    const regex = /\[([^\]]+)\]/g;

    const matches = [];
    let match;
    while ((match = regex.exec(this.umlText())) !== null) {
        matches.push(match[1]);
    }
    this.javaScriptText.set(`Is [${start}] <- [${target}] redundant? ${redundant} ${matches}`)
  }

  submitUml() {
    let txt: string = this.umlText()
    txt = txt.replaceAll('\n',', ')
    this.diagram.set(txt)
  }

  reset() {
    this.rawText.set(rawTextDefault)
    this.umlText.set(umlTextDefault)
    this.diagram.set(diagramDefault)
    this.errors.set([])
  }

  // Function to check if a dependency is redundant
  private isRedundant(dependencies: { [key: string]: string[] }, start: string, target: string): boolean {
    const visited = new Set<string>();

    function dfs(node: string): boolean {
        if (node === target) return true;
        if (visited.has(node)) return false;
        visited.add(node);

        for (const neighbor of dependencies[node]) {
            if (dfs(neighbor)) return true;
        }
        return false;
    }

    for (const neighbor of dependencies[start]) {
        if (neighbor !== target && dfs(neighbor)) {
            return true;
        }
    }
    return false;
  }

  private cleanMe(input: string, lastPlugin: string): string {
    input = input.replace(/        xms-platform-g3\..*/gi, '')
    input = input.replace(/                    \d{2,3} compile project/gi, '')
    input = input.replace(/                build.gradle  .*/gi, '')
    input = input.replace(/  \(\d{1,2} usage.* found\)/gi, ']')
    input = input.replace(/            /gi, '[')
    input = input.replace(/\(':/gi, lastPlugin+'<-[')
    input = input.replace(/'\)/gi, ']')
    return input
  }

  private rowHasArrow(input: string): boolean {
    return input.includes('<-')
  }

  private process() {
    //test
    let txt: string = this.rawText()
    let exclusionLine: string = this.exclusionLine
    let txtArr: string[] = txt.split('\n')
    let found: boolean = false
    let umlArr: string[] = []
    let lastPlugin: string  = ''

    this.errors.set([])

    txtArr.forEach((row) => {
    
      //if line has exclusionLine start from here    
      if(found){
        row = this.cleanMe(row,lastPlugin)
        if(row){
          //IF row does not have arrow THEN set last plugin name
          if(!this.rowHasArrow(row)){
            lastPlugin = row
          } else {
            umlArr.push(row)
          }
        }
      }
      //Check for exlcusion line
      found = found ? true : row.includes(exclusionLine)
    })

    // do stuff
    // e.g. update txt with regex
    // e.g. set errors
    if(!found){
      this.errors.set(['unable to find removal line'])
    }

    if (!this.errors().length) {
      //set the text back
      this.umlText.set(umlArr.join('\n'))
    }
  }
}

bootstrapApplication(App)
