export async function load({ fetch }) {

	const response = await fetch('/api/bodys-of-water?category_id=1');
	const lakes = await response.json();

	return {
		lakes: lakes,
	};
}

