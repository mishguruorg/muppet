import anyTest, { TestInterface } from 'ava'
import * as stu from 'stu'
import { SinonStub } from 'sinon'

const test = anyTest as TestInterface<{
  device: {
    runCommandAndReadAll: SinonStub,
    runCommandAndReadAllAsString: SinonStub,
  },
  android: {
    whileAwake: <T>(deviceId: string, fn: () => Promise<T>) => Promise<T>,
  },
  deviceId: string,
}>

test.beforeEach((t) => {
  const device = stu.mock('../device')
  const android = stu.test('./index')

  const deviceId = 'deviceId'

  t.context = {
    device,
    android,
    deviceId,
  }
})

test('whileAwake: screen on', async (t) => {
  const { device, android, deviceId } = t.context
  device.runCommandAndReadAllAsString.resolves('mScreenOnFully=true')
  device.runCommandAndReadAll.resolves()

  const RESULT = 'RESULT'

  const result = await android.whileAwake(deviceId, async () => {
    return RESULT
  })

  t.is(result, RESULT)
  t.deepEqual(device.runCommandAndReadAll.args, [])
})

test('whileAwake: screen off', async (t) => {
  const { device, android, deviceId } = t.context
  device.runCommandAndReadAllAsString.resolves('mScreenOnFully=false')
  device.runCommandAndReadAll.resolves()

  const RESULT = 'RESULT'

  const result = await android.whileAwake(deviceId, async () => {
    return RESULT
  })

  t.is(result, RESULT)

  t.deepEqual(device.runCommandAndReadAll.args, [
    ['deviceId', 'input keyevent POWER'],
    ['deviceId', 'input keyevent POWER'],
  ])
})
