<script>
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import Badge from "@temporalio/ui/holocene/badge.svelte";
	import Loading from "@temporalio/ui/holocene/loading.svelte";
	import PageTitle from "@temporalio/ui/components/page-title.svelte";
	import Button from "@temporalio/ui/holocene/button.svelte";
	import githubMark from "../github-mark.svg";

	console.log("API url grabbed from .env: ", import.meta.env.VITE_API_URL);
	const API_URL = import.meta.env.VITE_API_URL;

	let fromAccount = "";
	let toAccount = "";
	let amount = 0;
	let transferSubmitted = false;
	let transferId = "";
	let transferState = "";
	let serverinfo = "";
	let workflowOutcome = null;
	let progressPercentage = 10;
	let chargeId = "";
	let failed = false;
	const fromAccounts = ["Checking", "Savings"];
	const toAccounts = [
		"Justine Morris",
		"Raúl Ruidíaz",
		"Iván Rancic",
		"Marta Montero",
	];

	async function transferMoney() {
		console.log(`transferring $${amount}`);
		const res = await fetch(`${API_URL}/runWorkflow`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				amount: amount,
			}),
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

	async function getServerInfo() {
		const res = await fetch(`${API_URL}/serverinfo`, {
			method: "GET",
		});

		const data = await res.json();
		return data;
	}

	// Unused function to get reason for workflow failure
	async function getWorkflowOutcome() {
		const res = await fetch(`${API_URL}/getWorkflowOutcome`, {
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
		serverinfo = await getServerInfo();

		const intervalId = setInterval(async () => {
			if (transferId === "") {
				return;
			}
			if (transferState.transferState === "finished" || failed) {
				return;
			}
			if (transferState.workflowStatus === "FAILED") {
				failed = true;
				return;
			}

			transferState = await getWorkflowState();
			progressPercentage = transferState.progressPercentage;
			chargeId = transferState.chargeResult.chargeId;
			console.log("transferState: ", transferState);
		}, 1000);

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
		<div class="sm:w-1/2 w-full border border-gray-200 p-4 rounded-md">
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
		<div class="sm:w-1/2 w-full border border-gray-200 p-4 rounded-md">
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
		<div class="sm:w-1/2 w-full border border-gray-200 p-4 rounded-md">
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
		<div
			class="sm:w-1/2 w-full mx-auto mt-10 bg-white shadow-lg rounded-lg overflow-hidden"
		>
			<div class="py-4 px-6">
				<h2 class="text-2xl font-bold text-gray-700">Submitted</h2>
				<p class="py-2 text-gray-700 font-semibold">
					From: <span class="font-normal">{fromAccount}</span>
				</p>
				<p class="py-2 text-gray-700 font-semibold">
					To: <span class="font-normal">{toAccount}</span>
				</p>
				<p class="py-2 text-gray-700 font-semibold">
					Amount: <span class="font-normal">${amount}</span>
				</p>
			</div>
			<div class="py-4 px-6">
				{#if failed}
					<p class="text-red-500 font-semibold">
						Transfer failed. Please try again later.
					</p>
					<!-- <p class="text-gray-400 text-sm">
						Confirmation: {chargeId}
					</p> -->
				{:else if progressPercentage === 100}
					<p class="text-green-500 font-semibold">
						Transfer complete!
					</p>
					<p class="text-gray-400 text-sm">
						Confirmation: {chargeId}
					</p>
				{:else if progressPercentage < 100}
					<p class="text-lightgrey-500 font-semibold">
						Transfer Progress: {progressPercentage}%
					</p>

					<div class="progress-bar">
						<div
							class="progress"
							style="width: {progressPercentage}%;"
						/>
					</div>
				{/if}
			</div>
			<div class="px-6 py-3 bg-gray-100 text-right">
				<p class="text-gray-400 text-sm">{transferId}</p>
			</div>
		</div>
	{/if}

	<h6>
		<a
			href="https://github.com/steveandroulakis/temporal-money-transfer"
			target="_blank"
		>
			<img src={githubMark} alt="Source Code" class="w-8 h-auto" /></a
		>
	</h6>

	<div class="px-6 py-3 bg-gray-100 text-center">
		<p class="text-gray-400 text-sm">
			Temporal Server
		</p>
		{#if !serverinfo.url}
			<p class="text-gray-400 text-sm">
				{serverinfo.address}
			</p>
		{:else}
			<p class="text-gray-400 text-sm">
				<a target="_blank" href="{serverinfo.url}">
					{serverinfo.address}
				</a>
			</p>
		{/if}
		<p class="text-gray-400 text-sm">Namespace: {serverinfo.namespace}</p>
	</div>
</section>
