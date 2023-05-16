<script>
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import Badge from "@temporalio/ui/holocene/badge.svelte"
  import Loading from "@temporalio/ui/holocene/loading.svelte"
  import PageTitle from "@temporalio/ui/components/page-title.svelte"
	import Button from '@temporalio/ui/holocene/button.svelte';

	let fromAccount = '';
	let toAccount = '';
	let amount = 0;
	const fromAccounts = ['Checking', 'Savings'];
  const toAccounts = ['Jordan Morris', 'Raúl Ruidíaz', 'Iván Rancic', 'Fredy Montero'];

	function transferMoney() {
		// Add your money transfer logic here
		alert(`Transferring $${amount} from ${fromAccount} to ${toAccount}.`);
	}

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

<PageTitle title="Money Transfer App" url={$page.url.href} />
<section class="flex flex-col gap-8 items-center">
	<Loading title="" />
	<h2 class="text-2xl flex items-center gap-1">Transfer Money</h2>
	<div class="w-1/2 border-2 border-gray-200 p-4 rounded-md">
		<label for="from-account" class="block text-sm font-medium text-gray-700">From Account</label>
		<select id="from-account" bind:value={fromAccount} class="mt-1 block w-full text-2xl">
			{#each fromAccounts as account (account)}
				<option>{account}</option>
			{/each}
		</select>
	</div>
	<div class="w-1/2 border-2 border-gray-200 p-4 rounded-md">
		<label for="to-account" class="block text-sm font-medium text-gray-700">To Account</label>
		<select id="to-account" bind:value={toAccount} class="mt-1 block w-full text-2xl">
			{#each toAccounts as account (account)}
				<option>{account}</option>
			{/each}
		</select>
	</div>
	<div class="w-1/2 border-2 border-gray-200 p-4 rounded-md">
		<label for="amount" class="block text-sm font-medium text-gray-700">Amount (In USD)</label>
		<input id="amount" type="number" bind:value={amount} class="mt-1 block w-full text-4xl"/>
	</div>
	<div class="">
		<Button on:click={transferMoney}>Transfer</Button>
	</div>

  <div>{seconds}</div>
  <button on:click={resetTimer}>Reset Timer</button>
</section>