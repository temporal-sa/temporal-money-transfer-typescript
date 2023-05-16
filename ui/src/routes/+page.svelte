<script>
  import { onMount } from "svelte";

  let seconds = 0;

  onMount(async () => {
    const intervalId = setInterval(async () => {
      const res = await fetch("http://localhost:3000/countSeconds");
      const data = await res.json();
      seconds = data.seconds;
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  });

  async function resetTimer() {
    await fetch("http://localhost:3000/resetTimer", {
      method: "POST",
    });
    // seconds = 0; for instant server-side update
  }
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
<div>{seconds}</div>
<button on:click={resetTimer}>Reset Timer</button>
