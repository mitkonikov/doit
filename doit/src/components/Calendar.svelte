<script lang="ts">
    import firebase from 'firebase/app';
    import Swal from 'sweetalert2/src/sweetalert2.js'
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
                let tempData = [...calendarData.data];

                let calendarStartDate = calendarData.start_date.toDate();
                let diff = dayDiff(calendarStartDate);

                // Decode the data from the db
                let countDays = 0;
                let prevMonthName = "";
                for (let month = 0; month < tempData.length; month++) {
                    let currentDate = new Date(calendarStartDate);
                    currentDate.setMonth(currentDate.getMonth() + month);
                    let daysInMonth = getDaysInMonth(currentDate.getMonth(), currentDate.getFullYear());

                    for (let day = 0; day < daysInMonth; day++) {
                        let isChecked = Boolean(tempData[month] & 1);
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

                        tempData[month] = tempData[month] >> 1;
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
            calendarData.data[day.month] ^= mask;
            if ((calendarData.data[day.month] & mask) > 0) {
                Swal.fire({
                    icon: 'success',
                    title: 'Congrats!',
                    text: 'Have a nice day!',
                });
            }

            updateCalendarData();
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
                }).then(getData);
            }
        });
    }

    function renameCalendar() {
        db.collection('calendars').doc(calendarId).update({
            name: document.getElementById('swal-rename-input').value
        }).then(() => {
            getData();
        });
    }

    const collapseSwitchId = "swal-collapse-switch-toggle";
    function updateShowCollapsedToggle(): void {
        if (calendarData.show_collapsed) {
            document.getElementById(collapseSwitchId).classList.add("swal-switch-toggle-checked");
        } else {
            document.getElementById(collapseSwitchId).classList.remove("swal-switch-toggle-checked");
        }
    }

    function isCollapsed(): Boolean {
        if (typeof calendarData.show_collapsed == "undefined") return false;
        return calendarData.show_collapsed;
    }

    async function updateCalendarData(): Promise<void> {
        await db.collection("calendars").doc(calendarId).update(calendarData);
        getData();
    }

    async function showSettings(): Promise<void> {
        settingsValues = await Swal.fire({
            title: 'Settings',
            html:
                'Name: <input id="swal-rename-input" class="swal2-input" value="' + calendarData.name + '">' +
                '<div id="swal-rename-button" class="swal2-btn">Rename</div>' + '<div id="swal-delete-button" class="swal2-btn">Delete Calendar</div>' +
                '<div class="swal-collapse-switch" id="swal-collapse-switch"><div class="swal-switch"><div class="swal-switch-toggle" id="swal-collapse-switch-toggle"></div></div>Show collapsed</div>',
            focusConfirm: false,
            didOpen: () => {
                updateShowCollapsedToggle();
                document.getElementById('swal-rename-button').onclick = renameCalendar;
                document.getElementById('swal-delete-button').onclick = deleteCalendar;
                document.getElementById('swal-collapse-switch').onclick = () => {
                    if (typeof calendarData.show_collapsed == "undefined") {
                        calendarData.show_collapsed = false;
                    }
                    
                    calendarData.show_collapsed = !calendarData.show_collapsed;
                    updateShowCollapsedToggle();
                    updateCalendarData();
                };
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
                    <div class="calendar-scroll-wrapper custom-scroll">
                        {#if !isCollapsed()}
                            <div class="calendar-months">
                                {#each monthNames as name}
                                    <div class="calendar-month">{name}</div>
                                {/each}
                            </div>
                        {/if}
                        <div class="calendar-checkboxes {isCollapsed() ? "collapsed": ""}">
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
                </div>
            {/if}
        {/if}
    </div>
</div>

<style lang="scss">
	@import './../theme/_smui-theme.scss';
    @import './../theme/common.scss';
    @import './../theme/tooltip.scss';
    @import './../scss/Calendar.scss';

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
        background-color: rgba(0, 255, 0, 0.082);

        &:hover {
            background-color: rgba(0, 255, 0, 0.4);
        }
    }

</style>