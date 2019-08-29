# @mishguru/muppet

> Utils for remote controlling android phone

## Device

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
