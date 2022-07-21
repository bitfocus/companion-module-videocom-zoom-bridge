import instance_skel = require('../../../instance_skel')
import {
	CompanionActions,
	CompanionConfigField,
	// CompanionFeedbacks,
	CompanionPreset,
	CompanionSystem,
} from '../../../instance_skel_types'
import { Config } from './config'
import { getActions } from './actions'
import { getConfigFields } from './config'
import { HTTP } from './http'
// import { getFeedbacks } from './feedback'
import { getPresets } from './presets'
import { Variables } from './variables'
interface bridge {
	id: number
	running: boolean
	ready: boolean
	ndiName: string
	meetingName: string
	pinnedUserId: string
	fps: number
	resolution: number
	mode: string
}

interface participant {
	id: string
	name: string
}
/**
 * Companion instance class for Zoom
 */
class ZoomBridgeInstance extends instance_skel<Config> {
	// Global call settings
	public ZoomBridgeClientDataObj: {
		bridges: bridge[]
		participants: participant[]
	} = {
		bridges: [],
		participants: [],
	}
	public variables: Variables | null = null
	public HTTP: HTTP | null = null

	constructor(system: CompanionSystem, id: string, config: Config) {
		super(system, id, config)
		this.system = system
		this.config = config
	}

	/**
	 * @description triggered on instance being enabled
	 */
	public init(): void {
		this.log('info', `Welcome, Zoom Bridge module is loading`)
		this.status(this.STATUS_WARNING, 'Connecting')
		this.HTTP = new HTTP(this)
		this.variables = new Variables(this)
		this.updateInstance()
	}

	/**
	 * @returns config options
	 * @description generates the config options available for this instance
	 */
	public readonly config_fields = (): CompanionConfigField[] => {
		return getConfigFields()
	}

	/**
	 * @param config new configuration data
	 * @description triggered every time the config for this instance is saved
	 */
	public updateConfig(config: Config): void {
		console.log('changing config!', config)
		this.config = config
		this.updateInstance()
	}

	/**
	 * @description close connections and stop timers/intervals
	 */
	public readonly destroy = (): void => {
		this.log('debug', `Instance destroyed: ${this.id}`)
	}

	/**
	 * @description Create and update variables
	 */
	public updateVariables(): void {
		if (this.variables) {
			console.log('update variables')
			this.variables.updateDefinitions()
			this.variables.updateVariables()
		}
	}

	/**
	 * @description sets actions, presets and feedbacks available for this instance
	 */
	public updateInstance(): void {
		// Cast actions and feedbacks from Zoom types to Companion types
		const actions = getActions(this) as CompanionActions
		// const feedbacks = getFeedbacks(this) as CompanionFeedbacks
		const presets = [...getPresets(this)] as CompanionPreset[]

		this.setActions(actions)
		// this.setFeedbackDefinitions(feedbacks)
		this.setPresetDefinitions(presets)
		this.updateVariables()
	}
}

export = ZoomBridgeInstance
