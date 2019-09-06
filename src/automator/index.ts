import tempy from 'tempy'
import { parseString } from 'xml2js'
import { promisify } from 'util'
import { unlink, readFile } from 'fs'
import { camelize } from 'camelize-object-key'

import * as device from '../device'

import Window from './window'
import Node from './node'

const parseStringAsync = promisify(parseString)
const readFileAsync = promisify(readFile)
const unlinkAsync = promisify(unlink)

const KEY_ENTER = 66
const KEY_BACK = 'KEYCODE_BACK'
const KEY_DEL = 'KEYCODE_DEL'
const KEY_MOVE_END = 'KEYCODE_MOVE_END'

const tryDumpWindow = async (deviceId: string) => {
  const uiautomatorResponse = await device.runCommandAndReadAllAsString(
    deviceId,
    'rm -f /sdcard/window_dump.xml && uiautomator dump --compressed /sdcard/window_dump.xml',
  )

  if (uiautomatorResponse.match(/^ERROR:/)) {
    throw new Error(uiautomatorResponse)
  }

  const destPath = tempy.file({ extension: '.xml' })
  await device.pullFile(deviceId, '/sdcard/window_dump.xml', destPath)

  const res = await readFileAsync(destPath, { encoding: 'utf8' })
  await unlinkAsync(destPath)

  const root = await parseStringAsync(res)
  return new Window(camelize(root))
}

const dumpWindow = async (
  deviceId: string,
  retry: number = 5,
): Promise<Window> => {
  try {
    const window = await tryDumpWindow(deviceId)
    return window
  } catch (error) {
    if (retry > 0) {
      return dumpWindow(deviceId, retry - 1)
    }
    throw error
  }
}

const tap = async (deviceId: string, x: number, y: number) => {
  return device.runCommandAndReadAll(deviceId, `input tap ${x} ${y}`)
}

const tapNode = async (deviceId: string, node: Node) => {
  const { x, y } = node.center()
  return tap(deviceId, x, y)
}

const longTouch = async (
  deviceId: string,
  x: number,
  y: number,
  duration: number = 1000,
) => {
  return device.runCommandAndReadAll(
    deviceId,
    `input swipe ${x} ${y} ${x} ${y} ${duration}`,
  )
}

const longTouchNode = async (deviceId: string, node: Node) => {
  const { x, y } = node.center()
  return longTouch(deviceId, x, y)
}

const type = async (deviceId: string, text: string) => {
  return device.runCommandAndReadAll(deviceId, `input text '${text}'`)
}

const pressKey = async (deviceId: string, keyCode: number | string) => {
  return device.runCommandAndReadAll(deviceId, `input keyevent ${keyCode}`)
}

const pressEnter = async (deviceId: string) => {
  return pressKey(deviceId, KEY_ENTER)
}

const pressBack = async (deviceId: string) => {
  return pressKey(deviceId, KEY_BACK)
}

const pressDelete = async (deviceId: string) => {
  return pressKey(deviceId, KEY_DEL)
}

const moveToEndOfInput = async (deviceId: string) => {
  return pressKey(deviceId, KEY_MOVE_END)
}

const clearTextInput = async (deviceId: string, node: Node) => {
  await tapNode(deviceId, node)
  await moveToEndOfInput(deviceId)

  // press the back button as fast as possible for each character
  const textLength = node.text().length
  await Promise.all(
    new Array(textLength).fill(null).map(() => pressDelete(deviceId)),
  )
}

export {
  dumpWindow,
  tapNode,
  longTouchNode,
  type,
  pressKey,
  pressEnter,
  pressBack,
  pressDelete,
  moveToEndOfInput,
  clearTextInput,
}
