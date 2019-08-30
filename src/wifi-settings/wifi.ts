import * as automator from '../automator'

const WIFI_SWITCH = 'com.android.settings:id/switch_bar'

const ON = 'On'
const OFF = 'Off'

const toggleWifi = async (deviceId: string, state: string) => {
  let window = await automator.dumpWindow(deviceId)

  let btn = window.mustFindNodeById(WIFI_SWITCH)
  if (btn.text() === state) {
    return
  }

  await automator.tapNode(deviceId, btn)
}

const enableWifi = (deviceId: string) => toggleWifi(deviceId, ON)

const disableWifi = async (deviceId: string) => toggleWifi(deviceId, OFF)

const restartWifi = async (deviceId: string) => {
  await disableWifi(deviceId)
  await enableWifi(deviceId)
}

export { enableWifi, disableWifi, restartWifi }
