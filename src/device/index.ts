import adb from 'adbkit'
import delay from 'delay'
import fs from 'fs'

import poll from '../poll'
import logger from '../logger'

const client = adb.createClient()

const REBOOT_TIMEOUT = 1000 * 60 * 2 // 2 minutes

class Device {
  public id: string

  static async firstDeviceAvailable () {
    const devices = await client.listDevices()
    if (devices.length < 1) {
      throw new Error('Could not find any devices :(')
    }
    const deviceId = devices[0].id
    return new Device(deviceId)
  }

  constructor (deviceId: string) {
    this.id = deviceId
  }

  async enableRoot () {
    try {
      await client.root(this.id)
      await client.remount(this.id)
      return true
    } catch (err) {
      if (err.message === 'adbd is already running as root') {
        return true
      }
      throw err
    }
  }

  runCommand (cmd: string) {
    logger.debug(`> ${cmd}`)
    return client.shell(this.id, cmd)
  }

  runCommandAndReadAll (cmd: string) {
    return this.runCommand(cmd).then(adb.util.readAll)
  }

  runCommandAndReadAllAsString (cmd: string) {
    return this.runCommandAndReadAll(cmd).then((buffer) => buffer.toString())
  }

  async pullFile (srcPath: string, destPath: string) {
    logger.debug(`[pull] "${srcPath}" -> "${destPath}"`)
    const transfer = await client.pull(this.id, srcPath)
    return new Promise((resolve, reject) => {
      transfer.on('end', resolve)
      transfer.on('error', reject)
      transfer.pipe(fs.createWriteStream(destPath))
    })
  }

  async pushFile (srcPath: string, destPath: string) {
    logger.debug(`[push] "${srcPath}" <- "${destPath}"`)
    const transfer = await client.push(this.id, srcPath, destPath)
    return new Promise((resolve, reject) => {
      transfer.on('end', resolve)
      transfer.on('error', reject)
    })
  }

  async reboot () {
    logger.debug('> reboot')
    await client.reboot(this.id)

    await poll(REBOOT_TIMEOUT, async () => {
      await delay(1000)

      const devices = await client.listDevices()
      const device = devices.find((d) => d.id === this.id)

      if (device == null || device.type === 'offline') {
        logger.debug('- device is offline')
        return false
      }

      const bootCompleted = await this.runCommandAndReadAllAsString(
        'getprop sys.boot_completed'
      )

      if (bootCompleted.match(/1/) == null) {
        logger.debug('- device is booting')
        return false
      }

      return true
    })
  }
}

export default Device
