<script>
	import { page } from '$app/stores';
</script>

<header>


	<nav>

		<ul>
			<li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
				<a href="/">Home</a>
			</li>
			<li aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
				<a href="/about">Log</a>
			</li>
		</ul>

	</nav>

</header>

<style>
	
</style>
