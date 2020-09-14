const getCalendarsFromTextBox = function() {
    return $('#calendars').val().split(/\n/);
  }

const getEventsFromMultipleCalendars = function(calIDs, startDate, endDate) {

    var eventsArray = [];

    // Create an array of promises
    var promisesArray = [];

    // for each cal_id create a promise and add to the array
    for (var i = 0, len = calIDs.length; i < len; i++) {
        promisesArray.push(getEventsFromASingleCalendar(startDate, endDate, calIDs[i]));
    }

    return Promise.all(promisesArray);

}

// List all the events from a single calendar - the summary and the attendees
const getEventsFromASingleCalendar = function(startDate, endDate, calendar_id) {

  return myPromise = new Promise(function(resolve,reject){
    // fetch all the events between timeMin and timeMax from the given calendar ID
    var request = gapi.client.calendar.events.list({
        'calendarId': calendar_id,
        'timeMax': endDate.toISOString(),
        'timeMin': startDate.toISOString(),
        'singleEvents': true
    });
    request.execute(function(response){
      var localEvents = [];
        for (var ev of response.items) {
            // add start time attribute to event
            ev.startTime = formattedDate(getDateObjectFromEvent(ev));
            // if there is a non-RH attendee, add the event to our list
            if(isThereANonRedHatterAttendee(ev)) {
                ev.cal_id = calendar_id; // add the calendar ID to the event object
                localEvents.push(ev); // add the event to the array of all the events
            }
        }
        console.log("Events fetched from calendar " + calendar_id);
        resolve(localEvents);
      });
    });
}

const updateListing = async function() {
    
    // Get dates from text boxes
    var startDateString = $('#start-date').val();
    var endDateString = $('#end-date').val();

    // Make date objects
    var startDate = new Date(startDateString); // min start date
    var endDate = new Date(endDateString);

    // get the date from textbox field
    var calIDs = getCalendarsFromTextBox();

    var data = await getEventsFromMultipleCalendars(calIDs, startDate, endDate); // get the events from all the calendars
    var flatData = [].concat.apply([], data); // flatten the array of arrays

    flatData = removeDuplicateEvents(flatData); // remove duplicate events (same event in multiple calendars)
    var sortedEvents = flatData.sort(eventDateComparator); // sort the events
    
    // show results tab
    $('#results-tab').tab('show');
    
    // update Vue table data
    vm.$data.tableEvents = sortedEvents;
}

const isThereANonRedHatterAttendee = function(ev) {
    if (typeof ev.attendees === 'undefined') { // skip if attendees is undefined
        return;
    }
    var attendees = Object.values(ev.attendees); // get array of attendees
    for (const attendee of attendees) {
        // if an attendee email address DOES NOT contain 'redhat', we know there is a non-RH attendee
        if (attendee.email.indexOf('redhat') == -1 &&
              attendee.email.indexOf('group.calendar.google.com') == -1) // also exclude group.calendar.google.com - shared calendars e.g. PTO calendars
            { 
                return true;
            }
    };
    return false;
}

// comparator function to sort events by their start time
const eventDateComparator = function(ev1, ev2) {
    return getDateObjectFromEvent(ev1) - getDateObjectFromEvent(ev2);
}

// creates date object from event (using start time or start date)
const getDateObjectFromEvent = function(ev) {
    // if datetime undefined (all-day event), use date instead
    return new Date(typeof ev.start.dateTime == 'undefined' ? ev.start.date : ev.start.dateTime);
}

const formattedDate = function(myDate) {
    // build the string format dd/mm/yyyy HH:MM
    var outputString = addZero(myDate.getDate());
    outputString = outputString + "/" + addZero(myDate.getMonth() + 1);
    outputString = outputString + "/" + myDate.getFullYear();
    outputString = outputString + " " + addZero(myDate.getHours());
    outputString = outputString + ":" + addZero(myDate.getMinutes());

    return outputString;
}

const removeDuplicateEvents = function(evs) {
    return evs.filter((ev, index, self) =>
        index === self.findIndex((ev2) => (
            ev2.id === ev.id
        ))
    )
}

// add leading zero to single digit number and convert to string
const addZero = function(i) {
    return (i < 10 ? "0" + i : "" + i);
}