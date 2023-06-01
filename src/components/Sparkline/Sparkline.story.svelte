<script>
  import Sparkline from './Sparkline.svelte'

  export let Hst
</script>
  
<Hst.Story>
  <Hst.Variant title="Default">
    <Sparkline />

    <svelte:fragment slot="controls">
      <!-- Put controls here -->
    </svelte:fragment>
  </Hst.Variant>
</Hst.Story>
