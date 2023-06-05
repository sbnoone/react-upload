import { MAX_PROGRESS } from 'app-constants'

const percentFormatter = new Intl.NumberFormat('en-US', {
	style: 'percent',
	maximumFractionDigits: 0,
})

interface ProgressBarProps {
	progress: number
	label?: string
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
	const value = progress <= MAX_PROGRESS ? Math.ceil(progress) : MAX_PROGRESS
	const transform = `translateX(${-MAX_PROGRESS + value}%)`
	return (
		<div>
			<div className='flex justify-between'>
				{label && <span className='pr-2'>{label}</span>}
				<span className='pl-2'>{percentFormatter.format(progress * 0.01)}</span>
			</div>
			<div
				role='progressbar'
				className='flex items-center overflow-hidden mt-1'
			>
				<div className='relative flex-1 w-[4px] h-[4px] overflow-hidden'>
					<div className='bg-slate-100 absolute block top-0 left-0 w-full h-full' />
					<div
						className='bg-blue-500 absolute block top-0 left-0 w-full h-full transition-transform'
						style={{ transform }}
					/>
				</div>
			</div>
		</div>
	)
}
