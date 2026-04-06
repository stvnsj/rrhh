
const dateFormat = require("./dateFormat");

exports.day = (year,month,day) => {

    const date = new Date(year,month-1,day);
    return "'" + dateFormat.dateFormat(date) + "'";
}
