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

  //TODO rename
  formatTypeScriptToUml() {
    const dependenciesByPlugin = this.createDependenciesByPlugin( this.umlText() )
    let umlCleanArr: string[] = []

    dependenciesByPlugin.forEach((dependencies,plugin) => {
      dependencies.forEach((dependency)=>{
        if(!this.isDependancyRedundant(dependenciesByPlugin, plugin, dependency)){
          umlCleanArr.push( `[${plugin}] <- [${dependency}]`)
        }
      })
    })

    this.typeScriptText()
    this.umlText.set(umlCleanArr.join('\n'))
  }

  formatUmlToTypeScript() {
    const dependenciesByPlugin = this.createDependenciesByPlugin( this.umlText() )
    let umlCleanArr: string[] = []

    dependenciesByPlugin.forEach((dependencies,plugin) => {
      umlCleanArr.push( `'${plugin}': {`)

      dependencies.forEach((dependency)=>{
        umlCleanArr.push(`\t'${dependency}', ${this.isDependancyRedundant(dependenciesByPlugin, plugin, dependency) ? '// Remove this':''}`)
      })
      umlCleanArr.push( `},`)
      
    })
    this.typeScriptText.set(umlCleanArr.join('\n'))
  }

  // Function to check if a dependency is redundant
  private isDependancyRedundant(dependencies: Map<string, Set<string>>, start: string, target: string): boolean {
    const visited = new Set<string>();

    //Depth-First Search
    function dfs(node: string): boolean {
        if (node === target) return true;
        if (visited.has(node)) return false;
        visited.add(node);

        const neighbors = dependencies.get(node);
        if (neighbors) {
            for (const neighbor of neighbors) {
                if (dfs(neighbor)) return true;
            }
        }
        return false;
    }

    const neighbors = dependencies.get(start);
    if (neighbors) {
        for (const neighbor of neighbors) {
            if (neighbor !== target && dfs(neighbor)) {
                return true;
            }
        }
    }
    return false;
  }

  // {'XmsWebapp' => Set(1), 'XmsOrders' => Set(2), 'XmsFulfilment' => Set(1), 'XmsConfig' => Set(3), 'XmsCore' => Set(1), …}
  private createDependenciesByPlugin(umlText: string): Map<string, Set<string>>{
    const umlArr: string[] = umlText.split('\n')
    const dependenciesByPlugin = new Map<string, Set<string>>()

    function addPluginAndDependancy(row: string){
      // [XmsWebapp]<-[XmsOrders] => ['XmsWebapp', 'XmsOrders']
      function getPluginAndDependancy(row: string): string[] {
        // Regular expression to match content inside square brackets
        const regex = /\[([^\]]+)\]/g;
        const plugins = [];
        let match;
        while ((match = regex.exec(row)) !== null) {
          plugins.push(match[1]);
        }
        return plugins
      }

      function getDependencies(plugin: string){
        let dependencies = dependenciesByPlugin.get(plugin)
        // Make plugin ref if not found
        if(!dependencies){
          dependencies = new Set<string>()
          dependenciesByPlugin.set(plugin, dependencies)
        }
        return dependencies
      }

      const pluginAndDependancy: string[] = getPluginAndDependancy(row)
      let dependencies = getDependencies(pluginAndDependancy[0])
      dependencies.add(pluginAndDependancy[1])
      getDependencies(pluginAndDependancy[1])
    }

    umlArr.forEach((row) => {
      addPluginAndDependancy(row)
    })
    return dependenciesByPlugin
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

  private cleanMe(input: string, lastPlugin: string): string {
    input = input.replace(/        xms-platform-g3\..*/gi, '')
    input = input.replace(/                    \d{2,3} compile project/gi, '')
    input = input.replace(/                build.gradle  .*/gi, '')
    input = input.replace(/  \(\d{1,2} usage.* found\)/gi, ']')
    input = input.replace(/            /gi, '[')
    input = input.replace(/\(':/gi, lastPlugin+'<-[') //Add the arrow
    input = input.replace(/'\)/gi, ']')
    return input
  }

  private rowHasArrow(input: string): boolean {
    return input.includes('<-')
  }

  //Format the raw contents into UML
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
