<script lang="ts">
	import type firebase from 'firebase';

    export let user: firebase.User;;
</script>

<div class="profile-container">
    <span class="profile-name">Hi { user.displayName }!</span>
</div>

<style lang="scss">
    .profile-container {
        padding: 0.6em 1.5em;
        width: fit-content;
    }

    .profile-name {
        font-size: 1.3em;
    }
</style>