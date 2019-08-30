# @mishguru/muppet

> Utils for remote controlling android phone

## device

```typescript
import { device } from '@mishguru/muppet'

const deviceId = await device.firstDeviceIdAvailable()

await device.enableRoot(deviceId)

await device.runCommand(deviceId, 'echo hello world')

const buffer = await device.runCommandAndAll(deviceId, 'ls')

const string = await device.runCommandAndReadAllAsString('deviceId, ls')

await device.pullFile(deviceId, '/etc/passwd', './local/passwd.txt')

await device.pushFile(deviceId, './local/cache.tgz', '/data/cache.tgz')

await device.reboot(deviceId, )
```

## android

```typescript
import { android } from '@mishguru/muppet'

await android.setSELinuxToEnforce(deviceId)

await android.writeId(deviceId, android.generateRandomId())

const androidId = await android.readId(deviceId)

await android.pressPowerButton(deviceId)

const isSleeping = await android.isSleeping(deviceId)

await android.toggleScreenAwake(deviceId, !isSleeping)

await android.whileAwake(deviceId, async () => {
  // phone is guranteed to be awake
  // and will be reset to it's existing state
  // when this function finishes
})

const batteryLevel = await android.batteryLevel(deviceId)

const screenshotPath = await android.screenshot(deviceId)
```

## automator

```typescript
import { automator } from '@mishguru/muppet'

const window = automator.dumpWindow(deviceId)
const node = window.findNodeById('android:id/button1')

const { x, y } = node.center()
await automator.tap(deviceId, x, y)

await automator.tapNode(deviceId, node)

await automator.longTouch(deviceId, x, y)

await automator.longTouchNode(deviceId, node)

await automator.type(deviceId, 'hello world')

await automator.pressKey(deviceId, 66)

await automator.pressEnter(deviceId)

await automator.pressBack(deviceId)

await automator.pressDelete(deviceId)

await automator.moveToEndOfInput(deviceId)

const textInput = window.findNodeById('android:id/textinput')
await automator.clearTextInput(deviceId, textInput)

// window
window.findNodeById()
window.mustFindNodeById()
window.findNodeByRegex()
window.mustFindNodeByRegex()
window.findNodeByText()
window.mustFindNodeByText()
window.toString

// node
node.id()
node.class()
node.text()
node.coords()
node.size()
node.center()
node.findChild()
node.toString()

```

## settings

```typescript
import { settings } from '@mishguru/muppet'

await settings.start(deviceId)

await settings.quit(deviceId)

await settings.getProxy(deviceId)

await settings.setProxy(deviceId, { host: '192.168.1.100', port: 8080 })

await settings.removeProxy()

await settings.restartWifi()
```

## Logger

```typescript
import { logger } from '@mishguru/muppet'

logger.debug(message)
logger.verbose(message)
logger.info({ success: true })
logger.error(message)
```

## poll

```typescript
import { poll } from '@mishguru/muppet'

// repeatedly loop a function
// until it either returns true
// or 2 seconds have passed

const timedOut = await poll(2000, async () => {
  const result = await device.runCommandAndReadAllAsString(deviceId, 'cat /data/status')
  return /ready/.test(result)
})

if (timedOut) {
  // ...
}
```
