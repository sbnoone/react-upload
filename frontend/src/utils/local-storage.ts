export const getStorageValue = <T>(key: string): T | undefined => {
	try {
		const item = localStorage.getItem(key)
		if (item === null) return undefined

		return parseItemFromLocalStorage(item)
	} catch (e) {
		console.error(`Error while getting from local storage with key: ${key}`, e)
	}
	return undefined
}

export const setStorageValue = <T>(key: string, value: T): void => {
	if (value == null) return

	const jsonValue = JSON.stringify(value)
	// const base64Value = base64EncodeUnicode(jsonValue)
	localStorage.setItem(key, jsonValue)
}

function parseItemFromLocalStorage<T>(item: any): T | undefined {
	try {
		const parsedItem = JSON.parse(item)
		if (isOfType<T>(parsedItem)) {
			return parsedItem
		}
	} catch (e) {
		console.error('Parse item from local storage error ', e)
	}
	return undefined
}

function isOfType<T>(val: any): val is T {
	return (val as T) !== undefined
}
