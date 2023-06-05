import { useState } from 'react'

import { getStorageValue, setStorageValue } from 'utils/local-storage'

const THEME_MODE_KEY = 'app-theme-mode'

type ThemeModeType = `${ThemeModeEnum}`
enum ThemeModeEnum {
	light = 'light',
	dark = 'dark',
}

export const useThemeModeToggle = () => {
	const [mode, setMode] = useState(() => getStorageValue<ThemeModeType>(THEME_MODE_KEY))
	const prefferDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

	if (mode === ThemeModeEnum.dark || (!mode && prefferDarkMode)) {
		document.documentElement.classList.add(ThemeModeEnum.dark)
	} else {
		document.documentElement.classList.remove(ThemeModeEnum.dark)
	}

	const toggleThemeMode = () => {
		const newMode = mode === ThemeModeEnum.light ? ThemeModeEnum.dark : ThemeModeEnum.light
		setStorageValue(THEME_MODE_KEY, newMode)
		setMode(newMode)
	}

	return toggleThemeMode
}
