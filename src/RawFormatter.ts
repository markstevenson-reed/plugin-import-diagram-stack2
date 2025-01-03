export class RawFormatter {

  private static ARROW: string = '<-'
  private static PROJECT_NAME: string = 'xms-platform-g3'

  private static isFirstRowToInspect(row: string): boolean {
    return !row.includes('(excluded)') && row.includes(this.PROJECT_NAME)
  }

  private static replaceMultipleSpaces(input: string): string {
    return input.replace(/ {2,}/g, ' ');
  }

  private static cleanMe(input: string, lastPlugin: string): string {
    input = this.replaceMultipleSpaces(input)
    let cleaned = input
    //.replace(/ '+this.PROJECT_NAME'+'\..*/gi, '') //Remove any lines like xms-platform-g3.XmsSomething  (4 usages found) 
    .replace(/ build.gradle.*/gi, '')
    .replace(/ \(\d{1,2} usage.* found\)/gi, ']')
    //89 compile project
    .replace(/ \d{2,3} compile project\(':/gi, lastPlugin + this.ARROW + '[') //Add the arrow when finds '(:'
    .replace(/ /gi, '[')
    .replace(/'\)/gi, ']')
    console.log("cleanMe('"+input+"', '"+lastPlugin+"') returns '"+cleaned+"'")
    return cleaned;
  }

  private static rowHasArrow(input: string): boolean {
    return input.includes(this.ARROW)
  }

  static format(txtArr: string[]): string[]{
    let umlArr: string[] = []
    let atFirstRowToInspect: boolean = false
    let lastPlugin: string  = ''

    txtArr.forEach((row) => {
      atFirstRowToInspect = atFirstRowToInspect ? true : this.isFirstRowToInspect(row)
      
      //if line has exclusionLine start from here    
      if(atFirstRowToInspect){
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
    })
    return umlArr
  }

}
