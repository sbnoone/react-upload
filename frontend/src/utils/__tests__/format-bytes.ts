import { describe, expect, it } from 'vitest'
import { formatBytes } from '../format-bytes'

describe('format-bytes.ts', () => {
	it('Should format correctly valid input', () => {
		const bytes = 1500000
		const expected = '1.43 MB'
		expect(formatBytes(bytes)).to.eq(expected)
	})

	it('Should return default value if bytes is falsy or less then 0', () => {
		const bytesZero = 0
		const lessThanZero = -1024
		const defaultValue = '0 Bytes'
		expect(formatBytes(bytesZero)).to.eq(defaultValue)
		expect(formatBytes(lessThanZero)).to.eq(defaultValue)
	})
})
