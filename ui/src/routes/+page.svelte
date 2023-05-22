<script>
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import Badge from "@temporalio/ui/holocene/badge.svelte";
	import Loading from "@temporalio/ui/holocene/loading.svelte";
	import PageTitle from "@temporalio/ui/components/page-title.svelte";
	import Button from "@temporalio/ui/holocene/button.svelte";

	let fromAccount = "";
	let toAccount = "";
	let amount = 0;
	let transferSubmitted = false;
	let transferId = "";
	let transferState = "";
	const fromAccounts = ["Checking", "Savings"];
	const toAccounts = [
		"Jordan Morris",
		"Raúl Ruidíaz",
		"Iván Rancic",
		"Fredy Montero",
	];

	async function transferMoney() {
		const res = await fetch("http://localhost:3000/runWorkflow", {
			method: "POST",
		});
		const data = await res.json();
		console.log(data);
		transferSubmitted = true;
		transferId = data.transferId;
	}

	async function getWorkflowState() {
		const res = await fetch("http://localhost:3000/runQuery", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				workflowId: transferId,
			}),
		});

		// fetch from runQuery with workflowId

		const data = await res.json();
		return data;
		// alert(`Transferring $${amount} from ${fromAccount} to ${toAccount}.`);
	}

	onMount(async () => {
		const intervalId = setInterval(async () => {
			if (transferId === "") {
				return;
			}
			transferState = await getWorkflowState();
		}, 5000);

		return () => {
			clearInterval(intervalId);
		};
	});

</script>

<PageTitle title="Money Transfer App" url={$page.url.href} />
<section class="flex flex-col gap-8 items-center">
	<Loading title="" />
	<h2 class="text-2xl flex items-center gap-1">Transfer Money</h2>
	{#if !transferSubmitted}
		<div class="w-1/2 border-2 border-gray-200 p-4 rounded-md">
			<label
				for="from-account"
				class="block text-sm font-medium text-gray-700"
				>From Account</label
			>
			<select
				id="from-account"
				bind:value={fromAccount}
				class="mt-1 block w-full text-2xl"
			>
				{#each fromAccounts as account (account)}
					<option>{account}</option>
				{/each}
			</select>
		</div>
		<div class="w-1/2 border-2 border-gray-200 p-4 rounded-md">
			<label
				for="to-account"
				class="block text-sm font-medium text-gray-700"
				>To Account</label
			>
			<select
				id="to-account"
				bind:value={toAccount}
				class="mt-1 block w-full text-2xl"
			>
				{#each toAccounts as account (account)}
					<option>{account}</option>
				{/each}
			</select>
		</div>
		<div class="w-1/2 border-2 border-gray-200 p-4 rounded-md">
			<label for="amount" class="block text-sm font-medium text-gray-700"
				>Amount (In USD)</label
			>
			<input
				id="amount"
				type="number"
				bind:value={amount}
				class="mt-1 block w-full text-4xl"
			/>
		</div>
		<div class="">
			<Button on:click={transferMoney}>Transfer</Button>
		</div>
	{:else}
		<div class="w-1/2 border-2 border-gray-200 p-4 rounded-md">
			<p>Transfer submitted:</p>
			<p>From: {fromAccount}</p>
			<p>To: {toAccount}</p>
			<p>Amount: ${amount}</p>
			<br/>
			<p>Transfer ID: {transferId}</p>
			<p>Transfer State: {transferState.state}</p>
		</div>
	{/if}
</section>
