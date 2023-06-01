<script>
  import Sparkline from "./Sparkline.svelte";
  let baseUrl = "http://localhost:5173/api/temperature?name=";
  const worthseeUrl = baseUrl + encodeURIComponent("Wörthsee");
  const waginerseeUrl = baseUrl + encodeURIComponent("Waginger See");
  export let Hst;
</script>

<Hst.Story layout={{ type: "grid", width: 200 }}>
  <Hst.Variant title="Wörthsee">
    <Sparkline url={worthseeUrl} />
  </Hst.Variant>

  <Hst.Variant title="Waginger See">
    <Sparkline url={waginerseeUrl} />
  </Hst.Variant>
</Hst.Story>
