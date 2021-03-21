<script lang="ts">
	import './theme/common.scss';

    import { collectionData } from 'rxfire/firestore';
    import { startWith } from 'rxjs/operators';
	import { db } from './ts/firebase';

	import Calendar from './components/Calendar.svelte';
	import AddCalendar from './components/AddCalendar.svelte';

	interface User {
		username: string;
		firstname: string;
		lastname: string;
		calendars: [string];
	}

	const query = db.collection('users').limit(1);
	const users = collectionData(query).pipe(startWith([]));
</script>

<main>
	<div class="center-vh">
		{#each $users as user}
			{#each user.calendars as calendar}
				<Calendar cid={calendar}></Calendar>
			{/each}
		{/each}

		<AddCalendar/>
	</div>

</main>

<style lang="scss">
	@import './theme/smui-theme.scss';
</style>