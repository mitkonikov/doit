<script lang="ts">
    import firebase from 'firebase/app';
    import Swal from 'sweetalert2';
    import { getDaysInMonth } from '../ts/calendar';
    import type { Calendar, Day } from '../ts/types';
	import { db } from './../ts/firebase';

    export let userId: string;
    export let calendarId: string;

    let calendarData: Calendar;
    let calendarDataSave: number[];
    let days: Day[] = [];
    let loaded = false;
    let monthNames: string[] = [];
    
    function getData() {
        days = [];
        monthNames = [];
        loaded = false;

        if (calendarId) {
            const calendarQuery = db.collection('calendars').doc(calendarId).get();
            calendarQuery.then((result) => {
                calendarData = result.data() as any;
                calendarDataSave = [...calendarData.data];

                let calendarStartDate = calendarData.start_date.toDate();
                let nowDate = new Date();

                const one_day = 1000 * 60 * 60 * 24;
    
                if (nowDate.getMonth() == 11 && calendarStartDate.getDate() > 25)
                    nowDate.setFullYear(nowDate.getFullYear() + 1);
                
                let dayDiff = Math.floor(Math.round(nowDate.getTime() - calendarStartDate.getTime()) / (one_day)) + 1;

                // Decode the data from the db
                let countDays = 0;
                let prevMonthName = "";
                for (let month = 0; month < calendarData.data.length; month++) {
                    let currentDate = new Date(calendarStartDate);
                    currentDate.setMonth(currentDate.getMonth() + month);
                    let daysInMonth = getDaysInMonth(currentDate.getMonth(), currentDate.getFullYear());

                    for (let day = 0; day < daysInMonth; day++) {
                        days.push({
                            checked: Boolean(calendarData.data[month] & 1),
                            tooltip: currentDate.toDateString(),
                            month, day
                        });

                        currentDate.setDate(currentDate.getDate() + 1);

                        calendarData.data[month] = calendarData.data[month] >> 1;
                        if (countDays % 7 == 0) {
                            let currentMonthName = currentDate.toDateString().split(' ')[1];
                            if (currentMonthName != prevMonthName) {
                                monthNames.push(currentMonthName);
                                prevMonthName = currentMonthName;
                            } else {
                                monthNames.push("");
                            }
                        }
                        
                        if (countDays == dayDiff - 1) break;
                        countDays++;
                    }
                }
                
                loaded = true;
            });
        }
    }

    getData();

    function checkDay(day: Day) {
        let currentDate = new Date().toDateString();
        if (day.tooltip == currentDate) {
            let mask = 1 << day.day;
            calendarDataSave[day.month] ^= mask;
            db.collection('calendars').doc(calendarId).update({
                data: calendarDataSave
            });

            getData();
        }
    }

    function deleteCalendar() {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((inputValue) => {
            if (inputValue.isConfirmed) {
                db.collection('calendars').doc(calendarId).delete();
                db.collection('users').doc(userId).update({
                    calendars: firebase.firestore.FieldValue.arrayRemove(calendarId)
                });
            }
        });
    }
</script>

<div class="calendar-container">
    <div class="calendar-main">
        {#if typeof calendarData != "undefined"}
            <span class="calendar-name">{calendarData.name}</span>
            <span class="delete-btn" on:click={deleteCalendar}>Delete</span>
            {#if loaded}
                <div class="calendar-months">
                    {#each monthNames as name}
                        <div class="calendar-month">{name}</div>
                    {/each}
                </div>
            {/if}
        {/if}
        <div class="calendar-checkboxes">
            {#if !loaded}
                Loading...
            {:else}
                {#each days as day, i}
                    <div 
                        class="calendar-day tooltipped 
                        {day.checked ? "checked" : ""}"
                        data-tooltip={day.tooltip}
                        on:click={() => checkDay(day)}
                    ></div>
                {/each}
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
	@import './../theme/_smui-theme.scss';
    @import './../theme/tooltip.scss';

    .calendar-container {
        width: 100%;
        background-color: rgba(0, 0, 0, 0.2);
        margin: 0.5em;
    }

    .calendar-main {
        color: #fff;
        padding: 1em;
        font-weight: 300;
    }

    .calendar-name {
        font-weight: 400;
    }

    .calendar-checkboxes, .calendar-months {
        position: relative;
        display: grid;
        grid-auto-flow: column;
        grid-template-rows: repeat(7, 1fr);
        row-gap: 0.3em;
        column-gap: 0.3em;
        width: fit-content;
        margin-top: 0.4em;
    }

    .calendar-months {
        grid-template-rows: repeat(1, 1fr);
    }

    .calendar-month {
        width: 1em;
        height: 1em;
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

    .delete-btn {
        cursor: pointer;
        font-weight: 300;
        right: 1em;
        float: right;
        font-size: 0.8em;
        padding: 0.5em;
        border-radius: 0.2em;

        &:hover {
            background-color: rgba(255, 0, 0, 0.4);
        }
    }
</style>