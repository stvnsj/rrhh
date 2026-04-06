






function sqlDate(dateTime){


    const date = dateTime.toISOString().split("T")[0];
    return date;
}

module.exports = sqlDate;