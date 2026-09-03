<script lang="ts">
	import Header from './header.svelte';

	let formState = $state({
		answers: {},
		step: 0,
		error: ''
	});

	const questions = [
		{
			id: 'name',
			question: 'What is your name?',
			type: 'text'
		},
		{
			id: 'birthday',
			question: 'What is your birthday?',
			type: 'date'
		}
	];
</script>

<Header name={formState.answers.name ?? 'User'} />

<article>
	<main>
		<p>Step: {formState.step + 1}</p>
		{#each questions as question, index (question.id)}
			{#if index === formState.step}
				{@render formStep({ question })}
			{/if}
		{/each}
		<p>{formState.error}</p>
	</main>
	{JSON.stringify(formState)}
</article>

{#snippet formStep({ question })}
	<label for="question-input">{question.question}</label>
	<input type={question.type} id="question-input" bind:value={formState.answers[question.id]} />
	<button
		onclick={() => {
			if (formState.answers[question.id] !== '' && formState.answers[question.id]) {
				formState.step++;
				formState.error = '';
			} else {
				formState.error = question.id + ' ' + 'is required!';
			}
		}}>Next</button
	>
{/snippet}

<style>
	main {
		display: flex;
		flex-direction: column;
		width: 200px;
	}

	button {
		border-style: solid;
		border-width: 1px;
		border-color: black;
		border-radius: 8px;
		padding: 5px;
		background-color: teal;
		color: white;

		&:hover {
			background-color: darkcyan;
		}

		&:active {
			transform: scale(0.9);
		}
	}
</style>
