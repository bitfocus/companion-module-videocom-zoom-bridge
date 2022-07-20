import {
	CompanionActionEventInfo,
	CompanionActionEvent,
	SomeCompanionInputField,
	CompanionActions,
} from '../../../instance_skel_types'
import ZoomBridgeInstance from './index'

/**
 * Define what is needed
 */
interface StartBridgeActionCallback {
	action: string
	options: Readonly<{
		command: string
		actionID?: string
		name?: string
	}>
}
interface StopBridgeActionCallback {
	action: string
	options: Readonly<{
		command: string
		actionID?: string
		name?: string
	}>
}
export interface ZoomBridgeActions {
	StartBridge: ZoomBridgeAction<StartBridgeActionCallback>
	StopBridge: ZoomBridgeAction<StopBridgeActionCallback>
}

export type ActionCallbacks = StartBridgeActionCallback | StopBridgeActionCallback

// Actions specific to Zoom
export interface ZoomBridgeAction<T> {
	label: string
	description?: string
	options: InputFieldWithDefault[]
	callback: (
		action: Readonly<Omit<CompanionActionEvent, 'options' | 'id'> & T>,
		info: Readonly<CompanionActionEventInfo | null>
	) => void
	subscribe?: (action: Readonly<Omit<CompanionActionEvent, 'options' | 'id'> & T>) => void
	unsubscribe?: (action: Readonly<Omit<CompanionActionEvent, 'options' | 'id'> & T>) => void
}

// Force options to have a default to prevent sending undefined values
type InputFieldWithDefault = Exclude<SomeCompanionInputField, 'default'> & { default: string | number | boolean | null }

/**
 * Main function to create the actions
 * @param instance Give the instance so we can extract data
 * @returns CompanionActions
 */
export function getActions(instance: ZoomBridgeInstance): CompanionActions {
	/**
	 * Construct the command like I want and send it to the OSC
	 * @param action
	 * @param _info
	 */
	const sendActionCommand = (action: Readonly<ActionCallbacks>, _info?: CompanionActionEventInfo | null): void => {
		// Construct command
		let command = action.options.command
		if (instance.HTTP) instance.HTTP.sendCommand(command)
	}

	let CHOICES_BRIDGES = [{ id: '1', label: 'Get Bridges first' }]
	let CHOICES_PARTICIPANTS = [{ id: '1', label: 'none' }]
	let CHOICES_MODES = [
		{ id: 'active-speaker', label: 'Active speaker' },
		{ id: 'gallery', label: 'Gallery' },
		{ id: 'screensharing', label: 'Screensharing' },
	]
	if (instance.ZoomBridgeClientDataObj.bridges.length > 0) CHOICES_BRIDGES.length = 0
	instance.ZoomBridgeClientDataObj.bridges.forEach((bridge) => {
		CHOICES_BRIDGES.push({ id: bridge.id.toString(), label: bridge.meetingName })
	})
	if (instance.ZoomBridgeClientDataObj.participants.length > 0) CHOICES_PARTICIPANTS.length = 0
	instance.ZoomBridgeClientDataObj.participants.forEach((participant) => {
		CHOICES_PARTICIPANTS.push({ id: participant.id, label: participant.name })
	})

	return {
		StartBridge: {
			label: 'Start Bridge',
			options: [
				{
					type: 'dropdown',
					label: 'Bridge',
					id: 'bridgeID',
					default: '1',
					choices: CHOICES_BRIDGES,
				},
			],
			callback: (action) => {
				const sendToCommand: any = {
					id: 'StartBridge',
					options: {
						command: `bridge/${action.options.bridgeID}/start`,
					},
				}
				sendActionCommand(sendToCommand)
			},
		},
		StartNewBridge: {
			label: 'Start a (new) Bridge',
			options: [
				{
					type: 'number',
					label: 'Bridge',
					id: 'bridgeID',
					min: 1,
					max: 6,
					default: 1,
				},
			],
			callback: (action) => {
				const sendToCommand: any = {
					id: 'StartBridge',
					options: {
						command: `bridge/${action.options.bridgeID}/start`,
					},
				}
				sendActionCommand(sendToCommand)
			},
		},
		StopBridge: {
			label: 'Stop Bridge',
			options: [
				{
					type: 'dropdown',
					label: 'Bridge',
					id: 'bridgeID',
					default: '1',
					choices: CHOICES_BRIDGES,
				},
			],
			callback: (action) => {
				const sendToCommand: any = {
					id: 'StopBridge',
					options: {
						command: `bridge/${action.options.bridgeID}/stop`,
					},
				}
				sendActionCommand(sendToCommand)
			},
		},
		Participants: {
			label: 'Get participants',
			options: [],
			callback: () => {
				const sendToCommand: any = {
					id: 'Participants',
					options: {
						command: `participants`,
					},
				}
				sendActionCommand(sendToCommand)
			},
		},
		Bridges: {
			label: 'Get bridges',
			options: [],
			callback: () => {
				const sendToCommand: any = {
					id: 'Bridges',
					options: {
						command: `bridges`,
					},
				}
				sendActionCommand(sendToCommand)
			},
		},
		// BridgeById: {
		// 	label: 'Bridge by id',
		// 	options: [
		// 		{
		// 			type: 'dropdown',
		// 			label: 'Bridge',
		// 			id: 'bridgeID',
		// 			default: '1',
		// 			choices: CHOICES_BRIDGES,
		// 		},
		// 	],
		// 	callback: (action) => {
		// 		const sendToCommand: any = {
		// 			id: 'BridgeById',
		// 			options: {
		// 				command: `bridge/${action.options.bridgeID}`,
		// 			},
		// 		}
		// 		sendActionCommand(sendToCommand)
		// 	},
		// },
		PinParticipantOnBridge: {
			label: 'Pin participant on bridge',
			options: [
				{
					type: 'dropdown',
					label: 'Bridge',
					id: 'bridgeID',
					default: '1',
					choices: CHOICES_BRIDGES,
				},
				{
					type: 'dropdown',
					label: 'Participant',
					id: 'zoomID',
					default: '1',
					choices: CHOICES_PARTICIPANTS,
				},
			],
			callback: (action) => {
				const sendToCommand: any = {
					id: 'PinParticipantOnBridge',
					options: {
						command: `bridge/${action.options.bridgeID}/pin/${action.options.zoomID}`,
					},
				}
				sendActionCommand(sendToCommand)
			},
		},
		RemovePinnedParticipantFromBridge: {
			label: 'Remove pinned participant from bridge',
			options: [
				{
					type: 'dropdown',
					label: 'Bridge',
					id: 'bridgeID',
					default: '1',
					choices: CHOICES_BRIDGES,
				},
			],
			callback: (action) => {
				const sendToCommand: any = {
					id: 'RemovePinnedParticipantFromBridge',
					options: {
						command: `bridge/${action.options.bridgeID}/remove`,
					},
				}
				sendActionCommand(sendToCommand)
			},
		},
		SwitchMode: {
			label: 'Switch mode',
			options: [
				{
					type: 'dropdown',
					label: 'Bridge',
					id: 'bridgeID',
					default: '1',
					choices: CHOICES_BRIDGES,
				},
				{
					type: 'dropdown',
					label: 'mode',
					id: 'mode',
					default: 'active-speaker',
					choices: CHOICES_MODES,
				},
			],
			callback: (action) => {
				const sendToCommand: any = {
					id: 'SwitchMode',
					options: {
						command: `bridge/${action.options.bridgeID}/${action.options.mode}`,
					},
				}
				sendActionCommand(sendToCommand)
			},
		},
	}
}
