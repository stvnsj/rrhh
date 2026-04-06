


exports.dateFormat = (date) => {

    var strDate =
	date.getFullYear() + "-" +
	((date.getMonth()+1).toString().length != 2 ? "0" + (date.getMonth() + 1) : (date.getMonth()+1)) + "-" +
	(date.getDate().toString().length != 2 ? "0" + date.getDate() : date.getDate());

    return strDate;
}
