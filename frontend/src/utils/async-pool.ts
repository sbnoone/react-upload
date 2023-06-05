type AsyncPoolOptions<
	TIterable extends unknown[],
	TFn extends (item: TIterable[number]) => unknown
> = {
	/** Number of maximum concurrent promises */
	concurrency: number
	/** The iterable containing the items for the async tasks */
	iterable: TIterable
	/** The function to be executed for each item in the iterable */
	iteratorFn: TFn
}

/**
 * Runs a pool of asynchronous tasks with a maximum concurrency level.
 *
 * @template TIterable - Type of iterable passed as input to the async tasks.
 * @template TFn - Type of the function that will be run for each item in the iterable.
 * @template TReturn - Type of the returned value of the async function.
 *
 * @param {AsyncPoolOptions<TIterable, TFn>} options - The options for the async pool.
 * @param {number} options.concurrency - The maximum number of tasks that can be executed concurrently.
 * @param {TIterable} options.iterable - The iterable containing the items for the async tasks.
 * @param {TFn} options.iteratorFn - The function to be executed for each item in the iterable.
 * @returns {Promise<TReturn[]>} - The array of results from each of the async tasks.
 */
export async function asyncPool<
	TIterable extends unknown[],
	TFn extends (item: TIterable[number]) => TReturn,
	TReturn = ReturnType<TFn>
>({ concurrency, iterable, iteratorFn }: AsyncPoolOptions<TIterable, TFn>): Promise<TReturn[]> {
	const ret: Promise<TReturn>[] = [] // Store all asynchronous tasks
	const executing = new Set<Promise<TReturn>>() // Stores executing asynchronous tasks

	for (const item of iterable) {
		// Item it's just an index here
		// Call the iteratorFn function to create an asynchronous task
		const p: Promise<TReturn> = Promise.resolve().then(() => iteratorFn(item /* iterable*/))

		ret.push(p) // save new async task
		executing.add(p) // Save an executing asynchronous task

		const clean = () => executing.delete(p)
		p.then(clean).catch(clean)

		if (executing.size >= concurrency) {
			// Wait for faster task execution to complete
			await Promise.race(executing)
		}
	}
	return Promise.all(ret)
}
