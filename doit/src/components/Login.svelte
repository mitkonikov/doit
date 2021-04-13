<script lang="ts">
    import Google from 'svelte-material-icons/Google.svelte';

    export let click: Function;
</script>

<div class="login-btn" on:click={() => click()}>
    <div class="login-center">
        <Google size="1.8em"/>
        <span class="login-span">Sign in</span>
    </div>
</div>

<style lang="scss">
    @import './../theme/smui-theme.scss';

    .login-center {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .login-span {
        margin-left: 0.3em;
        font-size: 1.1em;
    }

    .login-btn {
        font-family: 'Roboto Light';
        display: inline-block;
        margin: 0.5em;
        padding: 1em;
        border: 0.08em #fff solid;

        &:hover {
            background-color: $mdc-theme-background;
            cursor: pointer;
        }
    }
</style>