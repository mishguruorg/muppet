import { Stream } from 'stream'

declare module 'adbkit' {
  interface Device {
    id: string,
    type: string,
  }

  interface ADBClient {
    listDevices: () => Device[],
    root: (serial: string) => Promise<void>,
    reboot: (serial: string) => Promise<void>,
    remount: (serial: string) => Promise<void>,
    shell: (serial: string, cmd: string) => Promise<Stream>,
    pull: (serial: string, srcPath: string) => Promise<Stream>,
    push: (serial: string, srcPath: string, destPath: string) => Promise<Stream>,
  }

  interface Util {
    readAll: (stream: Stream) => Promise<Buffer>,
  }

  export function createClient(): ADBClient
  export const util: Util
}
