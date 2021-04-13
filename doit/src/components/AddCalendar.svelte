<script lang="ts">
    import { db } from "../ts/firebase";
    import firebase from 'firebase/app';

    export let uid: string;
    
    function addCalendar() {
        let name = prompt("Name of the calendar: ");
        db.collection('calendars').add({
            uid,
            data: [0],
            name,
            start_date: firebase.firestore.Timestamp.fromDate(new Date())
        }).then((reference) => {
            db.collection('users').doc(uid).update({
                calendars: firebase.firestore.FieldValue.arrayUnion(reference.id)
            });
        });
    }
</script>

<div class="add-calendar-btn" on:click={addCalendar}>
    Add new Calendar
</div>

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
</style>