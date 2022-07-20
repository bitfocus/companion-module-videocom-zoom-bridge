import ZoomBridgeInstance from './'
import _ from 'lodash'

// interface InstanceVariableDefinition {
// 	label: string
// 	name: string
// 	type?: string
// }

interface InstanceVariableValue {
	[key: string]: string | number | undefined
}

export class Variables {
	private readonly instance: ZoomBridgeInstance

	constructor(instance: ZoomBridgeInstance) {
		this.instance = instance
	}

	/**
	 * @param name Instance variable name
	 * @returns Value of instance variable or undefined
	 * @description Retrieves instance variable from any Zoom instances
	 */
	public readonly get = (variable: string): string | undefined => {
		let data

		this.instance.parseVariables(variable, (value) => {
			data = value
		})

		return data
	}

	/**
	 * @param variables Object of variable names and their values
	 * @description Updates or removes variable for current instance
	 */
	public readonly set = (variables: InstanceVariableValue): void => {
		const newVariables: { [variableId: string]: string | undefined } = {}

		for (const name in variables) {
			newVariables[name] = variables[name]?.toString()
		}

		this.instance.setVariables(newVariables)
	}

	/**
	 * @description Sets variable definitions
	 */
	public readonly updateDefinitions = (): void => {
		let participants = []
		// The participants
		for (let index = 0; index < this.instance.ZoomBridgeClientDataObj.participants.length; index++) {
			participants.push({
				label: `Participant`,
				name: `Participant ${index + 1}`,
			})
		}
		let bridges = []
		// The bridges
		for (let index = 0; index < this.instance.ZoomBridgeClientDataObj.bridges.length; index++) {
			bridges.push({
				label: `Bridge info`,
				name: `Bridge ${index + 1}`,
			})
		}

		let filteredVariables = [...participants, ...bridges]

		this.instance.setVariableDefinitions(filteredVariables)
	}

	/**
	 * @description Update variables
	 */
	public readonly updateVariables = (): void => {
		const newVariables: InstanceVariableValue = {}
		for (let index = 0; index < this.instance.ZoomBridgeClientDataObj.participants.length; index++) {
			newVariables[`Participant ${index + 1}`] = `${this.instance.ZoomBridgeClientDataObj.participants[index].name}, ${this.instance.ZoomBridgeClientDataObj.participants[index].id}`
		}
		for (let index = 0; index < this.instance.ZoomBridgeClientDataObj.bridges.length; index++) {
			newVariables[`Bridge ${index + 1}`] = `${this.instance.ZoomBridgeClientDataObj.bridges[index].ndiName}, resolution:${this.instance.ZoomBridgeClientDataObj.bridges[index].resolution}, fps:${this.instance.ZoomBridgeClientDataObj.bridges[index].fps}`
		}

		this.set(newVariables)

		this.updateDefinitions()
	}
}
