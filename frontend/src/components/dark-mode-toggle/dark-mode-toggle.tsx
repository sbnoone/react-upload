import { useThemeModeToggle } from 'hooks/use-dark-mode'

export const DarkModeToggle = () => {
	const toggleThemeMode = useThemeModeToggle()
	return (
		<button
			type='button'
			onClick={toggleThemeMode}
			className={
				'px-3 py-2 border-2 border-solid rounded-lg hover:bg-gray-100 transition-colors active:bg-gray-200 dark:hover:text-stone-900 dark:active:text-stone-900'
			}
		>
			Toggle theme
		</button>
	)
}
