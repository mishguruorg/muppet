import logger from '../logger'
import * as device from '../device'

import * as proxy from './proxy'
import * as wifi from './wifi'

export interface Proxy {
  host: string,
  port: number,
}

const start = async (deviceId: string): Promise<void> => {
  logger.verbose('Starting the Settings app...')
  await device.runCommandAndReadAll(
    deviceId,
    'am start -n com.android.settings/.wifi.WifiSettings',
  )
}

const quit = async (deviceId: string): Promise<void> => {
  logger.verbose('Quitting the Settings app...')
  await device.runCommandAndReadAll(
    deviceId,
    'am force-stop com.android.settings',
  )
}

const getProxy = (deviceId: string): Promise<Proxy> => {
  logger.verbose('Getting the wifi proxy...')
  return proxy.getProxy(deviceId)
}

const setProxy = (deviceId: string, config: Proxy): Promise<void> => {
  const { port, host } = config
  logger.verbose(`Setting the wifi proxy to ${host}:${port}...`)
  return proxy.setProxy(deviceId, host, port)
}

const removeProxy = (deviceId: string): Promise<void> => {
  logger.verbose('Removing the wifi proxy...')
  return proxy.removeProxy(deviceId)
}

const restartWifi = (deviceId: string): Promise<void> => {
  logger.verbose('Enabling the wifi...')
  return wifi.restartWifi(deviceId)
}

export { start, quit, getProxy, setProxy, removeProxy, restartWifi }
