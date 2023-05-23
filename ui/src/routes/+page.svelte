<script>
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import Badge from "@temporalio/ui/holocene/badge.svelte";
	import Loading from "@temporalio/ui/holocene/loading.svelte";
	import PageTitle from "@temporalio/ui/components/page-title.svelte";
	import Button from "@temporalio/ui/holocene/button.svelte";

	console.log("API url grabbed from .env: ", import.meta.env.VITE_API_URL);
	const API_URL = import.meta.env.VITE_API_URL

	let fromAccount = "";
	let toAccount = "";
	let amount = 0;
	let transferSubmitted = false;
	let transferId = "";
	let transferState = "";
	let progressPercentage = 10;
	const fromAccounts = ["Checking", "Savings"];
	const toAccounts = [
		"Jordan Morris",
		"Raúl Ruidíaz",
		"Iván Rancic",
		"Fredy Montero",
	];

	async function transferMoney() {
		const res = await fetch(`${API_URL}/runWorkflow`, {
			method: "POST"
		});
		const data = await res.json();
		console.log(data);
		transferSubmitted = true;
		transferId = data.transferId;
	}

	async function getWorkflowState() {
		const res = await fetch(`${API_URL}/runQuery`, {
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
			progressPercentage = transferState.state;
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
	<div class="w-1/2 mx-auto mt-10 bg-white shadow-lg rounded-lg overflow-hidden">
		<div class="py-4 px-6">
			<h2 class="text-2xl font-bold text-gray-700">Submitted</h2>
			<p class="py-2 text-gray-700 font-semibold">From: <span class="font-normal">{fromAccount}</span></p>
			<p class="py-2 text-gray-700 font-semibold">To: <span class="font-normal">{toAccount}</span></p>
			<p class="py-2 text-gray-700 font-semibold">Amount: <span class="font-normal">${amount}</span></p>
		</div>
		<div class="py-4 px-6">
			{#if progressPercentage === 100}
				<p class="text-green-500 font-semibold">Transfer complete!</p>
			{/if}
			{#if progressPercentage < 100}
				<p class="text-lightgrey-500 font-semibold">Transfer Progress: {progressPercentage}%</p>

				<div class="progress-bar">
					<div class="progress" style="width: {progressPercentage}%;">
					</div>
				</div>
			{/if}
		</div>		
		<div class="px-6 py-3 bg-gray-100 text-right">
			<p class="text-gray-400 text-sm">Transfer ID: {transferId}</p>
		</div>
	</div>
	
	{/if}
</section>
