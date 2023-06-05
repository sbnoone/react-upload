import { useReducer } from 'react'

export function useForceRerender() {
	const [, forceRerender] = useReducer((x: number) => x + 1, 0)
	return forceRerender
}
