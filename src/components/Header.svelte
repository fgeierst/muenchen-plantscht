<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import Logo from "$lib/icons/Logo.svelte";
  import Nav from "./Nav.svelte";

  const pageTitles: Record<string, string> = {
    [base]: "Pools",
    [`${base}/saunas`]: "Saunas",
    [`${base}/favorites`]: "Favorites",
  };

  const title = $derived.by(() => {
    const path = $page.url.pathname.replace(/\/+$/, "");
    const name = pageTitles[path];
    return name ? `${name} – München Plantscht` : "München Plantscht";
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta
    name="description"
    content="Real-time capacity level display of the Munich public swimming pools, with historical data"
  />
</svelte:head>

<header>
  <a href={base} class="title">
    <div class="title__logo"><Logo /></div>
    <h1 class="title__text">München Plantscht</h1>
  </a>

  <Nav />
</header>

<style>
  .title {
    display: flex;
    width: fit-content;
    padding-inline-end: 0.3em;
    color: var(--munich-black);
    gap: 0.7rem;
    margin-block-end: 0.5rem;
    align-items: center;
    text-decoration: none;
    font-size: 200%;
  }

  .title__logo {
    width: 1.6em;
  }

  .title__text {
    font-size: inherit;
    font-weight: inherit;
    margin: 0;
  }

  .title:focus-visible {
    outline-offset: -4px;
  }
</style>
