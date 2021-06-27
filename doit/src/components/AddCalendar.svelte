<script lang="ts">
    import { db } from "../ts/firebase";
    import firebase from 'firebase/app';

    import IconButton from '@smui/icon-button/styled';
    
    import PlusCircle from 'svelte-material-icons/PlusCircle.svelte';

    import Swal from 'sweetalert2/src/sweetalert2.js'

    export let uid: string;
    
    function addCalendar() {
        Swal.fire({
            title: 'New Calendar',
            text: 'Enter the name of the new calendar:',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'Create',
        }).then((inputValue) => {
            if (inputValue.isConfirmed) {
                // create a calendar
                let name = inputValue.value;
                let currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                db.collection('calendars').add({
                    uid,
                    data: [0],
                    name,
                    start_date: firebase.firestore.Timestamp.fromDate(currentDate)
                }).then((reference) => {
                    db.collection('users').doc(uid).update({
                        calendars: firebase.firestore.FieldValue.arrayUnion(reference.id)
                    });
                });
            }
        });
    }
</script>

<div class="add-calendar">
    <IconButton on:click={addCalendar}>
        <PlusCircle/>
    </IconButton>
    <span class="add-calendar-info">Add a calender</span>
</div>

<style lang="scss">
    .add-calendar {
        margin-top: 1em;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .add-calendar-info {
        font-size: 0.9em;
        margin-left: 0.4em;
    }
</style>