import crypto from 'crypto'
import tempy from 'tempy'

import logger from '../logger'
import * as device from '../device'

const generateRandomId = (): string => {
  return crypto
    .randomBytes(8)
    .toString('hex')
    .slice(0, 15)
}

const setSELinuxToEnforce = async (deviceId: string) => {
  await device.runCommandAndReadAll(deviceId, 'setenforce 1')
}

const writeId = async (deviceId: string, androidId: string) => {
  logger.verbose('Deleting the current Android ID...')
  await device.runCommandAndReadAll(
    deviceId,
    'content delete --uri content://settings/secure --where \'name="android_id"\'',
  )

  logger.verbose(`Setting the Android device ID to "${androidId}"...`)
  await device.runCommandAndReadAll(
    deviceId,
    `content insert --uri content://settings/secure --bind name:s:android_id --bind value:s:${androidId}`,
  )
}

const readId = async (deviceId: string): Promise<string> => {
  const res = await device.runCommandAndReadAllAsString(
    deviceId,
    'content query --uri content://settings/secure --where \'name="android_id"\'',
  )

  const match = res.match(/(?!value=)[a-f0-9]{15}/)

  if (match == null) {
    throw new Error(`Could not read Android ID! Output from phone: "${res}"`)
  }

  const androidId = match[0]
  return androidId
}

const pressPowerButton = async (deviceId: string) => {
  logger.verbose('Pressing the power button...')
  return device.runCommandAndReadAll(deviceId, 'input keyevent POWER')
}

const isSleeping = async (deviceId: string): Promise<boolean> => {
  const res = await device.runCommandAndReadAllAsString(
    deviceId,
    'dumpsys window policy | grep mScreenOnFully',
  )

  const match = res.match(/(?!mScreenOnFully=)(true|false)/)

  if (match == null) {
    throw new Error('Could not detect if screen is on!')
  }

  const isDeviceSleeping = match[0] === 'false'
  return isDeviceSleeping
}

const toggleScreenAwake = async (deviceId: string, awake: boolean) => {
  const isAwake = !(await isSleeping(deviceId))
  if (isAwake !== awake) {
    await pressPowerButton(deviceId)
  }
}

// makes sure the phone is awake while executing a function
// if the phone was already awake, it will leave it awake
const whileAwake = async <T>(deviceId: string, fn: () => Promise<T>) => {
  const wasSleeping = await isSleeping(deviceId)
  if (wasSleeping) {
    await pressPowerButton(deviceId)
  }
  try {
    const result = await fn()
    return result
  } catch (error) {
    throw error
  } finally {
    if (wasSleeping) {
      await pressPowerButton(deviceId)
    }
  }
}

const batteryLevel = async (deviceId: string): Promise<number> => {
  const res = await device.runCommandAndReadAllAsString(
    deviceId,
    'dumpsys battery | grep level',
  )

  const match = res.match(/\d+/)

  if (match == null) {
    throw new Error('Could not parse battery level!')
  }

  const level = match[0]
  return parseInt(level, 10)
}

const screenshot = async (
  deviceId: string,
  destPath?: string,
): Promise<string> => {
  const path = '/sdcard/screen.png'

  if (destPath == null) {
    destPath = tempy.file({ extension: '.png' })
  }

  await device.runCommandAndReadAll(deviceId, `screencap ${path}`)

  await device.pullFile(deviceId, path, destPath)

  return destPath
}

const appVersion = async ( deviceId: string, appName: string): Promise<string> => {
  const res = await device.runCommandAndReadAllAsString(
    deviceId,
    `dumpsys package "${appName}"| grep versionName`,
  )

  const match = res.match(/\d+\.\d+\.\d+\.\d+/)
  if (match == null) {
    throw new Error(`Could not read version of ${appName}!`)
  }

  const version = match[0]
  return version
}

export {
  batteryLevel,
  generateRandomId,
  isSleeping,
  pressPowerButton,
  readId,
  screenshot,
  setSELinuxToEnforce,
  toggleScreenAwake,
  whileAwake,
  writeId,
  appVersion
}
