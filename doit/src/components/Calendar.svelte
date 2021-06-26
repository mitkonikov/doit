<script lang="ts">
    import firebase from 'firebase/app';
    import Swal from 'sweetalert2';
    import { dayDiff, getDaysInMonth } from '../ts/calendar';
    import type { Calendar, Day } from '../ts/types';
	import { db } from './../ts/firebase';

    export let userId: string;
    export let calendarId: string;

    let calendarData: Calendar;
    let calendarDataSave: number[];
    let days: Day[] = [];
    let loaded = false;
    let monthNames: string[] = [];
    let streak = 0;
    let settingsValues;
    
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
                let diff = dayDiff(calendarStartDate);

                // Decode the data from the db
                let countDays = 0;
                let prevMonthName = "";
                for (let month = 0; month < calendarData.data.length; month++) {
                    let currentDate = new Date(calendarStartDate);
                    currentDate.setMonth(currentDate.getMonth() + month);
                    let daysInMonth = getDaysInMonth(currentDate.getMonth(), currentDate.getFullYear());

                    for (let day = 0; day < daysInMonth; day++) {
                        let isChecked = Boolean(calendarData.data[month] & 1);
                        days.push({
                            checked: isChecked,
                            tooltip: currentDate.toDateString(),
                            month, day
                        });

                        if (isChecked) {
                            streak++;
                        } else {
                            streak = 0;
                        }

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
                        
                        if (countDays == diff - 1) break;
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
            if (calendarDataSave[day.month]) {
                Swal.fire({
                    icon: 'success',
                    title: 'Congrats!',
                    text: 'Have a nice day!',
                });
            }

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

    function renameCalendar(newName: string) {
        db.collection('calendars').doc(calendarId).update({
            name: document.getElementById('swal-rename-input').value
        }).then(() => {
            getData();
        });
    }

    async function showSettings() {
        settingsValues = await Swal.fire({
            title: 'Settings',
            html:
                '<input id="swal-rename-input" class="swal2-input" value="' + calendarData.name + '">' +
                '<div id="swal-rename-button" class="swal2-btn">Rename</div>' + '<div id="swal-delete-button" class="swal2-btn">Delete Calendar</div>',
            focusConfirm: false,
            didOpen: () => {
                document.getElementById('swal-rename-button').onclick = renameCalendar;
                document.getElementById('swal-delete-button').onclick = deleteCalendar;
            },
            preConfirm: () => {
                return [
                    document.getElementById('swal-rename-input').value
                ]
            }
        });
    }
</script>

<div class="calendar-container">
    <div class="calendar-main">
        {#if typeof calendarData != "undefined"}
            <span class="calendar-name">{calendarData.name}</span>
            {#if streak > 0}
                <span class="noselect streak">🔥 {streak}</span>
            {/if}
            <span class="settings-btn" on:click={() => showSettings()}>Settings</span>
            <div class="separator"></div>
            {#if loaded}
                <div class="calendar-checkbox-container">
                    <div class="calendar-months">
                        {#each monthNames as name}
                            <div class="calendar-month">{name}</div>
                        {/each}
                    </div>
                    <div class="calendar-checkboxes">
                        {#each days as day, i}
                            <div 
                                class="calendar-day tooltipped 
                                {day.checked ? "checked" : ""}"
                                data-tooltip={day.tooltip}
                                on:click={() => checkDay(day)}
                            ></div>
                        {/each}
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</div>

<style lang="scss">
	@import './../theme/_smui-theme.scss';
    @import './../theme/common.scss';
    @import './../theme/tooltip.scss';

    .calendar-container {
        width: calc(100% - 1em);
        background-color: rgba(0, 0, 0, 0.2);
        margin: 0.5em;
    }

    .calendar-main {
        position: relative;
        color: #fff;
        padding: 1em;
        font-weight: 300;
    }

    .calendar-name {
        font-weight: 400;
    }

    .calendar-checkbox-container {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        flex-direction: column;
        margin-top: 0.6em;
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

    .streak {
        margin-left: 2em;
        color: rgb(255, 102, 0);
        font-weight: 700;
    }

    .settings-btn {
        position: absolute;
        cursor: pointer;
        font-weight: 300;
        right: 1em;
        float: right;
        font-size: 0.8em;
        padding: 0.5em;
        border-radius: 0.2em;
        top: 0.4em;

        &:hover {
            background-color: rgba(0, 255, 0, 0.4);
        }
    }

</style>