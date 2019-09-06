import chalk from 'chalk'

export interface XmlNodeProps {
  index: string,
  text: string,
  resourceId: string,
  class: string,
  package: string,
  contentDesc: string,
  checkable: string,
  checked: string,
  clickable: string,
  enabled: string,
  focusable: string,
  focused: string,
  scrollable: string,
  longClickable: string,
  password: string,
  selected: string,
  bounds: string,
}

export interface XmlNode {
  $: XmlNodeProps,
  node?: XmlNode[],
}

class Node {
  public properties: XmlNodeProps
  public children: Node[]

  public constructor (xmlNode: XmlNode) {
    this.properties = xmlNode.$
    this.children =
      xmlNode.node == null ? [] : xmlNode.node.map((n) => new Node(n))
  }

  public id () {
    return this.properties.resourceId
  }

  public class () {
    return this.properties.class.replace(/^android\.widget\./, '')
  }

  public text () {
    return this.properties.text
  }

  public coords () {
    const { bounds } = this.properties
    const match = bounds.match(/^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$/)

    if (match == null) {
      throw new Error('Could not parse node bounds!')
    }

    const [, left, top, right, bottom] = match

    return {
      left: parseInt(left, 10),
      top: parseInt(top, 10),
      right: parseInt(right, 10),
      bottom: parseInt(bottom, 10),
    }
  }

  public size () {
    const { left, top, right, bottom } = this.coords()
    return {
      height: bottom - top,
      width: right - left,
    }
  }

  public center () {
    const { left, top } = this.coords()
    const { width, height } = this.size()
    return {
      x: Math.round(left + width / 2),
      y: Math.round(top + height / 2),
    }
  }

  public findChild (predicate: (node: Node) => boolean): Node {
    if (predicate(this) === true) {
      return this
    }

    for (let i = 0, len = this.children.length; i < len; i += 1) {
      const node = this.children[i]
      const result = node.findChild(predicate)
      if (result != null) {
        return result
      }
    }

    return null
  }

  public toString (prefix: string = '') {
    const className = chalk.blueBright(`[${this.class()}]`)

    const id = this.id().length > 0 ? chalk.greenBright(` ${this.id()}`) : ''

    const text = this.text().length > 0 ? chalk.white(` "${this.text()}"`) : ''

    const center = this.center()
    const dimensions = chalk.yellow(` @${center.x}x${center.y}`)

    let string = `${prefix}${className}${dimensions}${id}${text}\n`
    this.children.forEach((n) => {
      string += n.toString(prefix + '    ')
    })
    return string
  }
}

export default Node
