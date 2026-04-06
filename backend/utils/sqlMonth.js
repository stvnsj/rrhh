
const dateFormat = require("./dateFormat");



exports.initialDay = (year,month) => {

    const date = new Date(year,month-1); 
    return "\'"  + dateFormat.dateFormat(date)   +  "\'";
}

exports.finalDay = (year, month) => {

    const date = new Date(year,month);
    return "\'"  + dateFormat.dateFormat(date) + "\'";
}
