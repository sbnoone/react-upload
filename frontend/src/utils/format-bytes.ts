/**
 * Format a given number of bytes to human-readable string representation.
 * @param {number} bytes - The number of bytes to be formatted.
 * @param {number} [decimals=2] - The number of decimal places to display. Default is 2.
 * @returns {string} The human-readable string representation of the given number of bytes.
 * @see {@link https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript Stack Overflow}
 * @example
 * // Example usage:
 * const bytes = 1500000
 * const formattedBytes = formatBytes(bytes) // '1.43 MB'
 * console.log(formattedBytes)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
	if (!bytes || bytes < 0) return '0 Bytes'

	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return `${(bytes / k ** i).toFixed(dm)} ${sizes[i]}`
}
