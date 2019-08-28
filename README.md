# @mishguru/muppet

> Utils for remote controlling android phone

## Device

```typescript
import { Device } from '@mishguru/muppet'

const device = Device.firstDeviceAvailable()

const device = new Device(id)

await device.enableRoot()

await device.runCommand('echo hello world')

const buffer = await device.runCommandAndAll('ls')

const string = await device.runCommandAndReadAllAsString('ls')

await device.pullFile('/etc/passwd', './local/passwd.txt')

await device.pushFile('./local/cache.tgz', '/data/cache.tgz')

await device.reboot()
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

```
import { poll } from '@mishguru/muppet'

// repeatedly loop a function
// until it either returns true
// or 2 seconds have passed

const timedOut = await poll(2000, async () => {
  const result = await device.runCommandAndReadAllAsString('ls')
  return result.match(/ready/) != null
})

if (timedOut) {
  // ...
}
```
