import ZoomBridgeInstance from '.'
import { request } from 'urllib'

interface bridge {
	id: number,
	running: boolean,
	ready: boolean,
	ndiName: string,
	meetingName: string,
	pinnedUserId: string,
	fps: number,
	resolution: number,
	mode: string
}

interface participant {
	id: string
	name: string
}

export class HTTP {
	private readonly instance: ZoomBridgeInstance
	private host: string = '127.0.0.1'
	private port: number = 7890

	constructor(instance: ZoomBridgeInstance) {
		this.instance = instance

		// Connect to Zoom Bridge
		this.Connect()
			.then(() => {
				this.instance.status(this.instance.STATUS_OK, 'Listening for first command')
				console.log('Zoom Bridge active')
			})
			.catch(() => {
				this.instance.log('warn', `Unable to connect, please configure a host and port in the instance configuration`)
				this.instance.status(this.instance.STATUS_ERROR, 'wrong settings')
			})
	}

	/**
	 * @description Close connection on instance disable/removal
	 */
	public readonly destroy = (): void => {}

	/**
	 * @description Do a check
	 */
	public readonly Connect = () => {
		let p = new Promise((resolve, reject) => {
			if (
				this.instance.config.host === undefined ||
				this.instance.config.host === '' ||
				this.instance.config.port === undefined
			) {
				reject('no host or port in database')
			}
			this.host = this.instance.config.host
			this.port = this.instance.config.port

			resolve('ready for HTTP requests')
		})
		return p
	}

	private processData = (data: string) => {
		try {
			let received = JSON.parse(data)
			console.log('received', received)
			if (received.error === true) {
				this.instance.log('info', received.status)
			} else if (received.okay === true) {
				this.instance.log('info', received.message)
				if (received.bridges) {
					this.instance.ZoomBridgeClientDataObj.bridges.length = 0
					received.bridges.forEach((bridge: bridge) => {
						this.instance.ZoomBridgeClientDataObj.bridges.push(bridge)
					});
					this.instance.updateInstance()
				}
				if (received.participants) {
					this.instance.ZoomBridgeClientDataObj.participants.length = 0
					received.participants.forEach((participant: participant) => {
						this.instance.ZoomBridgeClientDataObj.participants.push(participant)
					});
					this.instance.updateInstance()
				}
			}
		} catch (err) {
			console.error(err)
		}
	}

	/**
	 * @param command function and any params
	 * @description Check OSC connection status and format command to send to Zoom
	 */
	public readonly sendCommand = async (command: string): Promise<void> => {
		console.log(
			`sending: http://${this.instance.config.host}:${this.instance.config.port}/${this.instance.config.api_key}/${command}`
		)
		// http://localhost:7890/YOUR-API-KEY/bridges
		const { data } = await request(
			`http://${this.instance.config.host}:${this.instance.config.port}/${this.instance.config.api_key}/${command}`
		)
		// console.log('status: %s, body size: %d, headers: %j', res.statusCode, data.length, res.headers)
		this.processData(data.toString())
	}

	/**
	 * @description Check for config changes and start new connections/polling if needed
	 */
	public readonly update = (): void => {
		const hostCheck = this.instance.config.host !== this.host || this.instance.config.port !== this.port
		this.instance.config = this.instance.config
		if (hostCheck) {
			this.host = this.instance.config.host
			this.port = this.instance.config.port
			this.Connect()
		}
	}
}
