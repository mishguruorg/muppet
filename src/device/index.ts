import adb from 'adbkit'
import delay from 'delay'
import fs from 'fs'

import poll from '../poll'
import logger from '../logger'

const client = adb.createClient()

const REBOOT_TIMEOUT = 1000 * 60 * 2 // 2 minutes

const firstDeviceIdAvailable = async (): Promise<string> => {
  const devices = await client.listDevices()
  if (devices.length < 1) {
    throw new Error('Could not find any devices :(')
  }
  const deviceId = devices[0].id
  return deviceId
}

const enableRoot = async (deviceId: string) => {
  try {
    await client.root(deviceId)
    await client.remount(deviceId)
    return true
  } catch (err) {
    if (err.message === 'adbd is already running as root') {
      return true
    }
    throw err
  }
}

const runCommand = async (deviceId: string, cmd: string) => {
  logger.debug(`> ${cmd}`)
  return client.shell(deviceId, cmd)
}

const runCommandAndReadAll = async (deviceId: string, cmd: string) => {
  return runCommand(deviceId, cmd).then(adb.util.readAll)
}

const runCommandAndReadAllAsString = async (deviceId: string, cmd: string) => {
  return runCommandAndReadAll(deviceId, cmd).then((buffer) => buffer.toString())
}

const pullFile = async (
  deviceId: string,
  srcPath: string,
  destPath: string,
) => {
  logger.debug(`[pull] "${srcPath}" -> "${destPath}"`)
  const transfer = await client.pull(deviceId, srcPath)
  return new Promise((resolve, reject) => {
    transfer.on('end', resolve)
    transfer.on('error', reject)
    transfer.pipe(fs.createWriteStream(destPath))
  })
}

const pushFile = async (
  deviceId: string,
  srcPath: string,
  destPath: string,
) => {
  logger.debug(`[push] "${srcPath}" <- "${destPath}"`)
  const transfer = await client.push(deviceId, srcPath, destPath)
  return new Promise((resolve, reject) => {
    transfer.on('end', resolve)
    transfer.on('error', reject)
  })
}

const reboot = async (deviceId: string) => {
  logger.debug('> reboot')
  await client.reboot(deviceId)

  await poll(REBOOT_TIMEOUT, async () => {
    await delay(1000)

    const devices = await client.listDevices()
    const device = devices.find((d) => d.id === deviceId)

    if (device == null || device.type === 'offline') {
      logger.debug('- device is offline')
      return false
    }

    const bootCompleted = await runCommandAndReadAllAsString(
      deviceId,
      'getprop sys.boot_completed',
    )

    if (bootCompleted.match(/1/) == null) {
      logger.debug('- device is booting')
      return false
    }

    return true
  })
}

export {
  firstDeviceIdAvailable,
  enableRoot,
  runCommand,
  runCommandAndReadAll,
  runCommandAndReadAllAsString,
  pullFile,
  pushFile,
  reboot,
}
