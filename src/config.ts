import { SomeCompanionConfigField } from '../../../instance_skel_types'

export interface Config {
	label: string
	host: string
	port: number
	api_key: string
}

export const getConfigFields = (): SomeCompanionConfigField[] => {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target host',
			width: 6,
			default: '127.0.0.1',
		},
		{
			type: 'number',
			id: 'port',
			label: 'Port',
			width: 6,
			default: 7890,
			min: 1,
			max: 65535,
			step: 1,
		},
		{
			type: 'textinput',
			id: 'api_key',
			label: 'Your API key',
			default: "",
			width: 6,
		},
	]
}
