<script lang="ts">
	import { db } from './../ts/firebase';

    export let cid: unknown;

    let calendarData;

    const calendarQuery = db.collection('calendars').doc((cid as any).id).get();
	calendarQuery.then((result) => {
		calendarData = result.data();
	});

    let array = [];

    for (let i = 0; i < 100; i++) {
        if (Math.ceil(Math.random() * 10) % 2 == 0) {
            array.push(false);
        } else {
            array.push(true);
        }
    }
</script>

<main>
    <div class="calendar-main">
        {#if typeof calendarData != "undefined"}
            {calendarData.name}
        {/if}
        <div class="calendar-checkboxes">
            {#each array as a, i}
                <div class="calendar-day {a ? "checked" : ""}"></div>
            {/each}
        </div>
    </div>
</main>

<style lang="scss">
	@import './../theme/smui-theme.scss';

    .calendar-main {
        color: #fff;
        padding: 1em;
        font-weight: 300;
    }

    .calendar-checkboxes {
        position: relative;
        display: grid;
        grid-auto-flow: column;
        grid-template-rows: repeat(7, 1fr);
        row-gap: 0.3em;
        column-gap: 0.3em;
        width: fit-content;
    }

    .calendar-day {
        background-color: $unchecked-color;
        border-radius: 0.1em;
        width: 1em;
        height: 1em;

        &.checked {
            background-color: $checked-color;
            
            &:hover {
                background-color: darken($checked-color, 10%);
            }
        }

        &:hover {
            background-color: darken($unchecked-color, 10%);
        }
    }
</style>