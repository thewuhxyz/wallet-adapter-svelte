interface CallbackType {
	(arg?: any): void;
}

export function clickOutside(
	node: HTMLElement,
	callbackFunction: CallbackType
): SvelteActionReturnType {
	function onClick(event: MouseEvent) {
		if (
			node &&
			event.target instanceof Node &&
			!node.contains(event.target) &&
			!event.defaultPrevented
		) {
			callbackFunction(event);
		}
	}

	document.body.addEventListener('click', onClick, true);

	return {
		update(newCallbackFunction: CallbackType) {
			callbackFunction = newCallbackFunction;
		},
		destroy() {
			document.body.removeEventListener('click', onClick, true);
		}
	};
}

export function click(node: HTMLElement, callbackFunction: CallbackType): SvelteActionReturnType {
	function onClick(event: MouseEvent) {
		if (
			node &&
			event.target instanceof Node &&
			node.contains(event.target) &&
			!event.defaultPrevented
		) {
			callbackFunction(event);
		}
	}

	document.body.addEventListener('click', onClick, true);

	return {
		update(newCallbackFunction: CallbackType) {
			callbackFunction = newCallbackFunction;
		},
		destroy() {
			document.body.removeEventListener('click', onClick, true);
		}
	};
}
