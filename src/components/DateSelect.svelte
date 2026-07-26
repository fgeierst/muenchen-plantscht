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
