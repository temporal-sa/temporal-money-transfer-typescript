<script>
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import Badge from "@temporalio/ui/holocene/badge.svelte"
  import Loading from "@temporalio/ui/holocene/loading.svelte"
  import PageTitle from "@temporalio/ui/components/page-title.svelte"

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

<PageTitle title="Temporal SvelteKit Starter" url={$page.url.href} />
<section class="flex flex-col gap-8 items-center justify-center w-full h-screen">
	<Loading title="" />
	<h1 class="text-2xl flex items-center gap-1">Welcome to Temporal SvelteKit Starter!</h1>
	<div class="bg-gray-100 p-4 w-auto flex flex-col gap-2 items-center text-lg">
		<p class="flex gap-1">
			Project includes the <Badge type="running">@temporalio/ui</Badge> package and <Badge
				type="warning">tailwind</Badge
			> css
		</p>
    <div>{seconds}</div>
    <button on:click={resetTimer}>Reset Timer</button>
	</div>
	<a href="https://github.com/temporalio/ui" target="_blank" class="text-sm text-blue-700 underline"
		>Temporal UI Github</a
	>
</section>