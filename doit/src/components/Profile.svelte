<script>
    export let displayName;
    export let uid;

    console.log(uid);
</script>

<div class="profile-container">
    <span class="profile-name">Hi { displayName }!</span>
</div>

<style lang="scss">
    .profile-container {
        padding: 0.6em 1.5em;
        // border: 1px rgba(255, 255, 255, 0.308) solid;
        width: fit-content;
    }

    .profile-name {
        font-size: 1.3em;
    }
</style>