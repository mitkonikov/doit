<script lang="ts">
	import { auth, db, googleProvider } from './ts/firebase';
    import { authState } from 'rxfire/auth';

	import Calendar from './components/Calendar.svelte';
	import AddCalendar from './components/AddCalendar.svelte';
	import type firebase from 'firebase'
	import Profile from './components/Profile.svelte';
	import Login from './components/Login.svelte';
	import type { User } from './ts/types';
	import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';

	let user: firebase.User;
	let userData: User;
	let unsubUserObserver: Function;
	const unsubscribe = authState(auth).subscribe(async u => {
		user = u;
		if (user) {
			// check if user data in Firestore exists
			const userExists = await db.collection('users').doc(user.uid).get();
			if (!userExists.exists) {
				// If there's no previous user data, create it
				const account = {
					uid: user.uid
				};
				
				await db.collection('users').doc(user.uid).set(account, {
					merge: true
				});

				db.collection('users').doc(user.uid).get().then((document) => {
					userData = document.data() as any;
				});
			} else {
				userData = userExists.data() as any;
			}

			if (typeof unsubUserObserver == "undefined") {
				// Subscribe to the user document
				const userQuery = db.collection('users').doc(user.uid);
				unsubUserObserver = userQuery.onSnapshot(docSnapshot => userData = docSnapshot.data() as any);
			}
		}
	});

	function login() {
		auth.signInWithPopup(googleProvider);
	}

	function logout() {
		unsubUserObserver();
		auth.signOut();
	}

	if ('serviceWorker' in navigator) {
      	navigator.serviceWorker.register('/service-worker.js');
    }
</script>

<main>
	{#if user}
		<div class="center-vh">
			<Profile {user} {logout}></Profile>
			
			<div class="mobile-container center-vh">
				<div class="calendars custom-scroll">
					<AddCalendar uid={user.uid}/>
					{#if userData}
						{#each userData.calendars as calendarId}
							<Calendar userId={user.uid} {calendarId}></Calendar>
						{/each}
					{/if}
			
				</div>
			</div>
		</div>
	{:else}
		<div class="center-vh">
			<div class="auth-container center-vh">
				<div style="position: relative">
					<span class="main-logo noselect">
						DoIt!
					</span>
					<span class="alpha-tag noselect">ALPHA</span>
				</div>
				<div class="intro noselect">
					DoIt is a Web Application which allows you to track your everyday progress on one task and fill up a calendar doing regular small tasks each day.
				</div>
				<div>
					<LottiePlayer
						src="./animations/intro"
						autoplay="{true}"
						loop="{true}"
						controls="{false}"
						renderer="svg"
						background="transparent"
					/>
				</div>
				<div class="intro quote noselect">
					Success doesn't come from what you do occasionally, it comes from what you do consistently.
					<div class="quote-author"> - Marie Forleo. </div>
				</div>
				<Login click={login} />
				<span class="version noselect">0.0.014</span>
			</div>
		</div>
	{/if}

	
</main>

<style lang="scss">
	@import './theme/common.scss';
	@import './theme/_smui-theme.scss';

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

	.mobile-container {
		height: 100%;
		width: clamp(10em, 100%, 27em);
	}

	.calendars {
		width: 100%;
		max-height: 100%;
		overflow-x: hidden;
    	overflow-y: auto;
	}

	@media only screen and (max-width: 600px) {
		.calendars {
			padding-top: 5em;
		}
	}

	.auth-container {
		width: clamp(10em, 100%, 20em);
	}

	.main-logo {
		color: $mdc-theme-secondary;
		font-size: 4em;
		font-weight: 700;
	}

	.alpha-tag {
		font-size: 1.1em;
		color: $checked-color;
		position: absolute;
		top: 0;
		margin-left: 0.3em;
	}

	.intro {
		text-align: justify;
		font-weight: 300;
		padding: 1em 1.5em;
		width: 100%;
	}

	.quote {
		.quote-author {
			float: right;
			margin-top: 0.3em;
			font-weight: 400;
		}
	}

	@media only screen and (max-height: 640px) {
		.quote {
			display: none;
		}
	}

	.version {
		font-size: 0.7em;
	}
</style>