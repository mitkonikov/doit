<script lang="ts">
    import type { Calendar } from '../ts/types';
	import { db } from './../ts/firebase';

    export let calendarId: string;

    let calendarData: Calendar;
    let days = [];
    let loaded = false;

    if (calendarId) {
        const calendarQuery = db.collection('calendars').doc(calendarId).get();
        calendarQuery.then((result) => {
            calendarData = result.data() as any;
            console.log(calendarData);

            // Decode the data from the db
            for (let month = 0; month < calendarData.data.length; month++) {
                for (let day = 0; day < 30; day++) {
                    days.push(calendarData.data[month] & 1);
                    calendarData.data[month] = calendarData.data[month] >> 1;
                }
            }
            
            loaded = true;
            console.log(days);
        });
    }
</script>

<main>
    <div class="center-vh">
        <div class="calendar-main">
            {#if typeof calendarData != "undefined"}
                {calendarData.name}
            {/if}
            <div class="calendar-checkboxes">
                {#if !loaded}
                    Loading...
                {:else}
                    {#each days as day, i}
                        <div class="calendar-day {day ? "checked" : ""}"></div>
                    {/each}
                {/if}
            </div>
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