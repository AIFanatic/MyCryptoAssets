
var Explorers = new function() {
    this.multiexplorer = "https://multiexplorer.com/api/address_balance/fallback?address=";
    //this.token_balance_url = "https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x57d90b64a1a57749b0f932f1a3395792e12e7055&address=0xe04f27eb70e025b78871a2ad7eabe85e61212761";
    this.token_balance_url = "https://api.etherscan.io/api?module=account&action=tokenbalance";


    this.GetTokenBalance = function (address, contractAddress, decimals, cb_func) {
        // Get balance
        var url = this.token_balance_url+"&contractaddress="+contractAddress+"&address="+address;

        $.ajax({
            url: url,
            type: 'GET',
            success: function(json) {
                // Parse balance, need more checks around json
                if( json["message"] !== undefined && json["message"] == "OK"){
                    var balance = parseFloat(json["result"]);

                    cb_func(balance/(10**decimals));
                }
                else{
                    cb_func(0);
                }
            }
        });
    };

    this.GetBalance = function (address, name, symbol, cb_func) {
        // Get balance
        var url = this.multiexplorer+address+"&currency="+symbol;

        console.log(name + symbol + address);

        $.ajax({
            url: url,
            type: 'GET',
            success: function(json) {
                // Parse balance, need more checks around json
                var balance = json["balance"];
                
                console.log(balance);

                cb_func(balance);
            }
        });
    };
}