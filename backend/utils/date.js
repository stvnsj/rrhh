

function toSqlDateOnly(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error(`Fecha inválida: ${value}`);
  }

  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function numberToDate (year,month,day=1) {

  let date = year + '-';
  
  if(month < 10){

    date = date + '0' + month + '-';
  }
  else{

    date = date + month + '-';
  }

  if(day < 10){

    date = date + '0' + day;
  }

  else{

    date = date + day;
  }

  return date;

}

function stringToDate (year,month,day='01') {

  
  let date = year + '-';
  
  if(month.length < 2){

    date = date + '0' + month + '-';
  }

  else{

    date = date + month + '-';
  }

  if(day.length < 2){

    date = date + '0' + day;
  }

  else{

    date = date + day;
  }

  return date;


}







module.exports = numberToDate;
module.exports = stringToDate;
module.exports = toSqlDateOnly;