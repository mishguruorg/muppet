import Node, { XmlNode } from './node'

interface XmlWindowProps {
  rotation: string,
}

interface XmlWindowHierarchy {
  $: XmlWindowProps,
  node?: XmlNode[],
}

interface XmlWindow {
  hierarchy: XmlWindowHierarchy,
}

class Window {
  public properties: XmlWindowProps
  public root: Node

  public constructor (xmlWindow: XmlWindow) {
    const { hierarchy } = xmlWindow
    this.properties = hierarchy.$

    if (hierarchy.node == null || hierarchy.node.length === 0) {
      throw new Error('Empty window!')
    }
    this.root = new Node(hierarchy.node[0])
  }

  public findNodeById (nodeId: string) {
    return this.root.findChild((node) => node.id() === nodeId)
  }

  public mustFindNodeById (nodeId: string) {
    const node = this.findNodeById(nodeId)
    if (node == null) {
      throw new Error(`Could not find node with id: "${nodeId}"`)
    }
    return node
  }

  public findNodeByRegex (regex: RegExp) {
    return this.root.findChild((node) => regex.test(node.id()))
  }

  public mustFindNodeByRegex (regex: RegExp) {
    const node = this.findNodeByRegex(regex)
    if (node == null) {
      throw new Error(`Could not find node with regex: "${regex.toString()}"`)
    }
    return node
  }

  public findNodeByText (text: string) {
    return this.root.findChild((node) => node.text() === text)
  }

  public mustFindNodeByText (text: string) {
    const node = this.findNodeByText(text)
    if (node == null) {
      throw new Error(`Could not find node with text: "${text}"`)
    }
    return node
  }

  public toString () {
    return this.root.toString()
  }
}

export default Window
