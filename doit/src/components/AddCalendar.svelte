<script lang="ts">
    import { db } from "../ts/firebase";
    import firebase from 'firebase/app';

    import IconButton from '@smui/icon-button';
    
    import PlusCircle from 'svelte-material-icons/PlusCircle.svelte';
    import Tooltip, { Wrapper } from '@smui/tooltip';

    import Swal from 'sweetalert2';

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

<Wrapper>
    <span class="add-circle-container" on:click={addCalendar}>Add</span>
    <!-- <IconButton class="material-icons" on:click={addCalendar}>
        <PlusCircle/>
    </IconButton> -->
    <!-- <Tooltip>Add a calendar</Tooltip> -->
</Wrapper>

<style lang="scss">
    @import './../theme/smui-theme.scss';

    .add-calendar-btn {
        display: inline-block;
        margin: 0.5em;
        padding: 1em;
        border: 0.08em #fff solid;

        &:hover {
            background-color: $mdc-theme-background;
            cursor: pointer;
        }
    }

    .add-circle-container {
        padding: 1em;
    }
</style>