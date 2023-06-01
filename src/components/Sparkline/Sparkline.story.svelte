<script>
  import Sparkline from "./Sparkline.svelte";
  let baseUrl = "http://localhost:5173/api/temperature?name=";
  const worthseeUrl = baseUrl + encodeURIComponent("Wörthsee");
  const waginerseeUrl = baseUrl + encodeURIComponent("Waginger See");
  export let Hst;
</script>

<Hst.Story layout={{ type: "single", width: "100%" }}>
  <Hst.Variant title="Wörthsee">
    <Sparkline url={worthseeUrl} name="Wörthsee" />
  </Hst.Variant>

  <Hst.Variant title="Waginger See">
    <Sparkline url={waginerseeUrl} name="Waginger See" />
  </Hst.Variant>
</Hst.Story>
