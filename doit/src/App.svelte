<script lang="ts">
	import './theme/common.scss';

    import { collectionData } from 'rxfire/firestore';
    import { startWith } from 'rxjs/operators';
	import { auth, db, googleProvider } from './ts/firebase';
	import type { Observable } from 'rxjs';
    import { authState } from 'rxfire/auth';

	import Calendar from './components/Calendar.svelte';
	import AddCalendar from './components/AddCalendar.svelte';
	import type firebase from 'firebase'
	import Profile from './components/Profile.svelte';
	import Login from './components/Login.svelte';
	import type { User } from './ts/types';

	let user: firebase.User;
	let userData: User;
	const unsubscribe = authState(auth).subscribe(u => {
		user = u;
		if (user) {
			// const query = db.collection('calendars').where('uid', '==', user.uid);
			// const calendars = collectionData(query).pipe(startWith([]));
			// console.log(calendars);
			const account = {
				uid: user.uid,
				calendars: []
			};

			db.collection('users').doc(user.uid).set(account, {
				merge: true
			});

			userData = account;
		}
	});

	function login() {
		auth.signInWithPopup(googleProvider);
	}

</script>

<main>
	{#if user}
		<div class="center-vh">
			<Profile {...user}></Profile>
			<div class="special-btn" on:click={ () => auth.signOut() }>Logout</div>
			
			<div class="calendars">
				{#each userData.calendars as calendarId}
					<Calendar {calendarId}></Calendar>
				{/each}
		
				<AddCalendar/>
			</div>
		</div>
	{:else}
		<div class="center-vh">
			<div class="main-logo">
				DoIt!
			</div>
			<Login click={login} />
			<span class="version">0.0.001</span>
		</div>
	{/if}

	
</main>

<style lang="scss">
	@import './theme/smui-theme.scss';

	.special-btn {
		font-family: 'Roboto Light';
        display: inline-block;
        margin: 0.5em;
        padding: 0.6em 1em;
        border: 0.08em #fff solid;

        &:hover {
            background-color: $mdc-theme-background;
            cursor: pointer;
        }
	}

	.main-logo {
		color: $mdc-theme-secondary;
		font-size: 4em;
		font-weight: 700;
	}

	.version {
		font-size: 0.7em;
	}
</style>