<script lang="ts">
	import type firebase from 'firebase';

    export let user: firebase.User;
    export let logout: any;
    
    let menuVisible = false;
    function toggleMenu() {
        menuVisible = !menuVisible;
    }
</script>

<div class="profile-container">
    <div class="profile-img-container" on:click={toggleMenu}>
        <img src={user.photoURL} class="profile-img" alt="Profile">
    </div>
    {#if menuVisible}
        <div class="profile-quick-menu">
            <div class="logout-button" on:click={logout}>Logout</div>
        </div>
    {/if}
</div>

<style lang="scss">
    .profile-container {
        cursor: pointer;
        z-index: 10000;
    }

    .profile-img-container {
        position: absolute;
        top: 1em;
        right: 1em;
        padding: 0.3em;
        border-radius: 0.3em;
        width: 56px;
        height: 56px;
    
        &:hover {
            background-color: rgba(0, 0, 0, 0.2);
        };
    }

    .profile-quick-menu {
        position: absolute;
        top: 1em;
        right: 5.5em;
        padding: 0.6em;
        border-radius: 0.3em;
        background-color: rgba(0, 0, 0, 0.2);
    }

    .profile-img {
        width: 56px;
        height: 56px;
        border-radius: 0.3em;
    }
</style>