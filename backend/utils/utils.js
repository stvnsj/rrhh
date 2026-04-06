
let Processor = {
    normalize : function (code) {

        let normalized_code = code.toUpperCase();
        normalized_code = normalized_code.replace(/[^A-Z0-9]/g, '');
        return  normalized_code;
    }
}

let RutFun = {
    
	// Valida el rut con su cadena completa "XXXXXXXX-X"
	validaRut : function (rutCompleto) {

		rutCompleto = rutCompleto.replace("‐","-");
        rutCompleto = RutFun.normalize(rutCompleto);
        
		if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test( rutCompleto ))
			return false;
		var tmp 	= rutCompleto.split('-');
		var digv	= tmp[1]; 
		var rut 	= tmp[0];
		if ( digv == 'K' ) digv = 'k' ;
		
		return (RutFun.dv(rut) == digv );
	},
    
	dv : function(T){
		var M=0,S=1;
		for(;T;T=Math.floor(T/10))
			S=(S+T%10*(9-M++%6))%11;
		return S?S-1:'k';
	},

    normalize: function(rutCompleto) {
        rutCompleto = rutCompleto.replace(/k/g, 'K')
        rutCompleto = rutCompleto.replace(/[^0-9K-]/g, '');
        return rutCompleto;
    }
}




let DateModule = {


    toSqlDate : function (value) {
        // If it's already a JS Date
        if (value instanceof Date) {
            const y = value.getFullYear();
            const m = String(value.getMonth() + 1).padStart(2, '0'); // 0-based month
            const d = String(value.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;  // YYYY-MM-DD
        }

        // If it's a string like "29/12/2024"
        if (typeof value === 'string') {
            const [day, month, year] = value.split('/').map(s => s.trim());
            if (day && month && year) {
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }

        // If it's something else, return null or throw
        return null;
    }



}


module.exports = {
    
    RutFun:RutFun,
    Processor:Processor,
    DateModule:DateModule
}
