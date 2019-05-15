

const moment = require('moment');

/*
isValidDate is a method to validate hire_date with the given format and date string 
*/
function isValidDate(date) {
    return moment(date, 'YYYY-MM-DD', true).isValid()
}

/*
getValidTimeStamp is a method to get a validate timestamp for a start_time and end_time with
the given format and date string
*/
function getValidTimeStamp(dateTime) {
    var formattedTime = moment(dateTime).format('YYYY-MM-DD HH:mm:ss');
    return formattedTime;
}

/*
isValidTimeStamp is a method to validate start_time and end_time with the given string format date and time
*/
function isValidTimeStamp(dateTime) {
    return moment(dateTime, 'YYYY-MM-DD HH:mm:ss', true).isValid()
}

/*
validCurrentDate is a method to get the current date in the given format
*/
function validCurrentDate() {
    var datetime = new Date();
    var formatDate = moment(datetime).format('YYYY-MM-DD');
    return formatDate;
}

/*
getCurrentTimeStamp is a method to get the current date and time in the given format
*/
function getCurrentTimeStamp() {
    var datetime = new Date();
    var formatStamp = moment(datetime).format('YYYY-MM-DD HH:mm:ss');
    return formatStamp;
}

/*
getHMS is a method to get hour, min and seconds for a given start time or end_time
which takes the date and format as the input paramters
*/
function getHMS(date, format) {
    var hms = moment(date).format(format);
    return hms;
}

/*
getHourMin is a method to find end_min and end_sec of the end_time
which takes end_hour and end_min as the parameters
*/
function getHourMin(end_hour, end_min) {
    var endMin = 0;
    if (end_hour >= 18 && end_min > 0) {
        endMin = -1;
    } else {
        endMin = end_min;
    }
    return endMin;
}

/*
getDateFormat is a method to get the given date format from the 
the timestamp. It takes dateTimeStamp as a parameter
*/
function getDateFormat(dateTimeStamp) {
    var formatDateTime = moment(dateTimeStamp).format('YYYY-MM-DD');
    return formatDateTime;
}

/*
getDifference is a method to calculate the difference
between end_time and start_time in mili seconds
*/
function getDifference(start_time_timeStamp, end_time_timeStamp) {
    var date1 = moment(start_time_timeStamp, "YYYY-MM-DD HH:mm:ss");
    var date2 = moment(end_time_timeStamp, "YYYY-MM-DD HH:mm:ss");
    var diff = date2.diff(date1);
    return diff;
}

/*
getSevenDayBefore is a method to get the date one week before from the current date
*/
function getSevenDayBefore() {
    var dateFrom = moment(Date.now() - 7 * 24 * 3600 * 1000).format('YYYY-MM-DD');
    return dateFrom;
}

/*
getDayOfWeek is a method to get the day which is used to validate if the given day
is not saturday or sunday
*/
function getDayOfWeek(date) {
    var date = moment(date);
    var dow = date.day();
    return dow;
}

module.exports.isValidDate = isValidDate;
module.exports.validCurrentDate = validCurrentDate;
module.exports.getDayOfWeek = getDayOfWeek;
module.exports.isValidTimeStamp = isValidTimeStamp;
module.exports.getDateFormat = getDateFormat;
module.exports.getSevenDayBefore = getSevenDayBefore;
module.exports.getCurrentTimeStamp = getCurrentTimeStamp;
module.exports.getValidTimeStamp = getValidTimeStamp;
module.exports.getDifference = getDifference;
module.exports.getHMS = getHMS;
module.exports.getHourMin = getHourMin;
