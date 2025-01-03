export class UmlFormatter {
  // Function to check if a dependency is redundant
  static isDependancyRedundant(dependencies: Map<string, Set<string>>, start: string, target: string): boolean {
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

  // Starting example of uml text data
  static umlTextDefault: string = `[XmsWebapp]<-[XmsOrders]
  [XmsOrders]<-[XmsFulfilment]
  [XmsOrders]<-[XmsConfig]
  [XmsCore]<-[XmsRoles]
  [XmsLookup]<-[XmsCommon]
  [XmsRoles]<-[XmsLookup]
  [XmsRoles]<-[XmsSecurity]
  [XmsFulfilment]<-[XmsCore]
  [XmsConfig]<-[XmsCommonConfig]
  [XmsConfig]<-[XmsRoles]
  [XmsConfig]<-[XmsCore]`.replace(/ {2,}/g, ''); // replace multiple spaces

  // {'XmsWebapp' => Set(1), 'XmsOrders' => Set(2), 'XmsFulfilment' => Set(1), 'XmsConfig' => Set(3), 'XmsCore' => Set(1), …}
  static createDependenciesByPlugin(umlText: string): Map<string, Set<string>> {
    const umlArr: string[] = umlText.split('\n')
    const dependenciesByPlugin = new Map<string, Set<string>>()

    function addPluginAndDependancy(row: string) {
      // [XmsWebapp]<-[XmsOrders] => ['XmsWebapp', 'XmsOrders']
      function getPluginAndDependancy(row: string): string[] {
        // Regular expression to match content inside square brackets
        const regex = /\[([^\]]+)\]/g
        const plugins = []
        let match
        while ((match = regex.exec(row)) !== null) {
          plugins.push(match[1])
        }
        return plugins
      }

      function getDependencies(plugin: string) {
        let dependencies = dependenciesByPlugin.get(plugin)
        // Make plugin ref if not found
        if (!dependencies) {
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
}
