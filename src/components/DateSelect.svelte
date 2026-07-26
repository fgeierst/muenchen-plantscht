<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { berlinToday } from "$lib/pools";

	const value = $derived($page.url.searchParams.get("date") ?? berlinToday());

	function onchange(e: Event) {
		const target = e.target as HTMLInputElement;
		void goto(`?date=${target.value}`, { keepFocus: true, noScroll: true });
	}
</script>

<section aria-label="Date selection">
	<label for="date-select">Date</label>
	<input
		id="date-select"
		type="date"
		{value}
		max={berlinToday()}
		{onchange}
	/>
</section>

<style>
	section {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		padding-inline: 0.7rem;
	}

	label {
		font-size: inherit;
		font-weight: inherit;
	}

	input[type="date"] {
		font-family: inherit;
		font-size: inherit;
		color: var(--munich-black);
		background-color: var(--munich-blue);
		border: 1px solid var(--munich-border);
		border-radius: 0.25rem;
		padding: 0.3em 0.5em;
	}

	input[type="date"]::-webkit-calendar-picker-indicator {
		cursor: pointer;
	}
</style>
