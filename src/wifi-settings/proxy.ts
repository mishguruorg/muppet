import * as automator from '../automator'

const ACTIVE_NETWORK = 'android:id/summary'
const MODIFY_NETWORK_TEXT = 'Modify network'
const PROXY_SETTINGS = 'com.android.settings:id/proxy_settings'
const PROXY_HOST_INPUT = 'com.android.settings:id/proxy_hostname'
const PROXY_PORT_INPUT = 'com.android.settings:id/proxy_port'
const ADVANCED_SETTINGS = 'com.android.settings:id/wifi_advanced_toggle'
const NONE_TEXT = 'None'
const MANUAL_TEXT = 'Manual'
const SAVE_BUTTON = 'android:id/button1'
const PLACEHOLDER_PORT = '8080'

const navigateToWifiSettings = async (deviceId: string) => {
  let window = await automator.dumpWindow(deviceId)

  let activeNetwork = null
  try {
    activeNetwork = window.mustFindNodeById(ACTIVE_NETWORK)
  } catch (error) {
    throw new Error(
      'Cannot navigate to wifi settings, if the phone is not connected to a wifi network.',
    )
  }

  await automator.longTouchNode(deviceId, activeNetwork)
  window = await automator.dumpWindow(deviceId)

  const modifyNetwork = window.mustFindNodeByText(MODIFY_NETWORK_TEXT)
  await automator.tapNode(deviceId, modifyNetwork)

  window = await automator.dumpWindow(deviceId)
  await automator.pressBack(deviceId)
}

const navigateToProxySettings = async (deviceId: string) => {
  let window = await automator.dumpWindow(deviceId)

  let proxySettings = window.findNodeById(PROXY_SETTINGS)
  if (proxySettings == null) {
    const advancedSettings = window.mustFindNodeById(ADVANCED_SETTINGS)
    await automator.tapNode(deviceId, advancedSettings)
    window = await automator.dumpWindow(deviceId)
    proxySettings = window.mustFindNodeById(PROXY_SETTINGS)
  }

  const hostInput = window.findNodeById(PROXY_PORT_INPUT)
  if (hostInput == null) {
    automator.tapNode(deviceId, proxySettings)
    window = await automator.dumpWindow(deviceId)

    const manualOption = window.mustFindNodeByText(MANUAL_TEXT)
    automator.tapNode(deviceId, manualOption)
  }
}

const getProxy = async (deviceId: string) => {
  await navigateToWifiSettings(deviceId)

  let window = await automator.dumpWindow(deviceId)
  let hostInput = window.findNodeById(PROXY_HOST_INPUT)
  let portInput = window.findNodeById(PROXY_PORT_INPUT)

  if (hostInput == null) {
    // no proxy set
    return { host: null, port: null }
  }

  await navigateToProxySettings(deviceId)
  hostInput = window.mustFindNodeById(PROXY_HOST_INPUT)
  portInput = window.mustFindNodeById(PROXY_PORT_INPUT)
  const host = hostInput.text()
  const port = parseInt(portInput.text(), 10)

  return { host, port }
}

const setProxy = async (deviceId: string, host: string, port: number) => {
  await navigateToWifiSettings(deviceId)
  await navigateToProxySettings(deviceId)

  let window = await automator.dumpWindow(deviceId)
  const hostInput = window.mustFindNodeById(PROXY_HOST_INPUT)
  if (hostInput.text() !== host) {
    await automator.clearTextInput(deviceId, hostInput)
    await automator.type(deviceId, host)
    await automator.pressBack(deviceId)
    window = await automator.dumpWindow(deviceId)
  }

  const portInput = window.mustFindNodeById(PROXY_PORT_INPUT)
  if (
    portInput.text() !== port.toString() ||
    port.toString() === PLACEHOLDER_PORT
  ) {
    await automator.clearTextInput(deviceId, portInput)
    await automator.type(deviceId, port.toString())
    await automator.pressBack(deviceId)
    window = await automator.dumpWindow(deviceId)
  }

  const saveButton = window.mustFindNodeById(SAVE_BUTTON)
  await automator.tapNode(deviceId, saveButton)
}

const removeProxy = async (deviceId: string) => {
  await navigateToWifiSettings(deviceId)
  await navigateToProxySettings(deviceId)

  let window = await automator.dumpWindow(deviceId)
  const proxySettings = window.mustFindNodeById(PROXY_SETTINGS)
  automator.tapNode(deviceId, proxySettings)
  window = await automator.dumpWindow(deviceId)

  const noneOption = window.mustFindNodeByText(NONE_TEXT)
  automator.tapNode(deviceId, noneOption)
  window = await automator.dumpWindow(deviceId)

  const saveButton = window.mustFindNodeById(SAVE_BUTTON)
  await automator.tapNode(deviceId, saveButton)
}

export { getProxy, setProxy, removeProxy }
