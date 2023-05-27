export async function load({ fetch }) {

	const response = await fetch('/api/lakes');

	const lakes = await response.json();
	
	return {
		lakes: lakes,
	};
}

