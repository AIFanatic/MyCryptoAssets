// Dependencies:
// - Database

PortfolioJS.prototype.Explorers = new function() {
    //this.multiexplorer = "https://multiexplorer.com/api/address_balance/fallback?address=";
    this.multiexplorer = "http://192.168.0.110:8080/api/address_balance/fallback?address=";
    //this.token_balance_url = "https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x57d90b64a1a57749b0f932f1a3395792e12e7055&address=0xe04f27eb70e025b78871a2ad7eabe85e61212761";
    this.token_balance_url = "https://api.etherscan.io/api?module=account&action=tokenbalance";

    // URLs / BC explorers
    this.token_query_url = "http://localhost/portfolio/starter/token_cmc.php"; // Hackish and only required backend, TODO: Remove backend
    this.tickers_url = "https://api.coinmarketcap.com/v1/ticker/";
    this.tokens_url = "https://raw.githubusercontent.com/kvhnuke/etherwallet/mercury/app/scripts/tokens/ethTokens.json";
    this.tokens_contract_info = "https://api.ethplorer.io/getTokenInfo/"; // add "?apiKey=freekey" to the end

    // Tokens
    this.isToken = function(name, symbol, address){
        var address_initials = address.slice(0,2);
        var symbol_lower = symbol.toLowerCase();

        if(address_initials=="0x" ){
            if( symbol_lower!="eth" && symbol_lower!="etc" ){
                return true;
            }
        }

        return false;
    }

    
    this.isOnTokenList = function(symbol){
        if( Database.allTokens[symbol.toLowerCase()] !== undefined)
            return true;

        return false;
    }

    this.GetTokenInfoFromCMC = function(name, cb){
        $.ajax({
            url: this.token_query_url+"?action=getAddressByName&term="+name,
            type: 'GET',
            success: function(result) {
                var json = JSON.parse(result);

                if( json["msg"] !== undefined){
                    cb(json["msg"]);
                }
            }
        });
    }

    this.GetTokenInfoFromEthScan = function(address, cb_func){
        var url = this.tokens_contract_info+address+"?apiKey=freekey";

        $.ajax({url: url, success: function(result){
            cb_func(result);
        }});
    }

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

    this.GetTokenBalanceWrapper = function (address, name, symbol, cb_func) {
        var self = this;

        if(!this.isOnTokenList(symbol)){
            // Not on MEW list, search and let user choose token contract
            this.GetTokenInfoFromCMC(name, function(data){
                if(data.length==1){
                    // Only got one address back, no need to show contract list
                    var contractAddress = data[0]["address"];

                    self.GetTokenInfoFromEthScan(contractAddress, function(result){
                        var json = JSON.parse(result);
                        var contractDecimals = json["decimals"];
            
                        self.GetTokenBalance(address, contractAddress, contractDecimals, function(balance){
                            cb_func(balance);
                        });
                    });
                }
                else{
                    // Found more than 1 contract, let user choose which
                    /*self.Visual.UpdateTokenList(id, data);
                    mobi_token_list.show();*/
                }
            });
        }
        else{
            // Is on MEW list
            var contractAddress = Database.allTokens[symbol]["address"];
            var contractDecimals = Database.allTokens[symbol]["decimal"];

            this.GetTokenBalance(address, contractAddress, contractDecimals, function(balance){
                cb_func(balance);
            });
        }
    };

    // End Tokens

    this.GetBalanceCoin = function (address, name, symbol, cb_func) {
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

    // Wrapper
    this.GetBalance = function(address, name, symbol, cb_func) {
        //var isToken = this.isToken(new_coin["name"], new_coin["symbol"], new_coin["address"]);
        var isToken = this.isToken(name, symbol, address);

        if(isToken){
            // Need a helper here since it may not be on MEW list
            this.GetTokenBalanceWrapper(address, name, symbol, function(balance){
                cb_func(balance);
            });
        }
        else{
            this.GetBalanceCoin(address, name, symbol, function(balance){
                cb_func(balance);
            });
        }
    }

    // Coins/Tokens helpers
    this.GetCoinsFromCMC = function(cb_func){
        $.ajax({url: this.tickers_url, success: function(result){
            // Parse coins by key
            var coins_parsed = {};

            for (var i=0;i<result.length;i++) {
                var id = result[i]["id"];
                coins_parsed[id] = result[i];
            }

            if(cb_func) cb_func(coins_parsed);
        }});
    }

    this.GetTokensFromMEW = function(cb_func){
        $.ajax({url: this.tokens_url, success: function(result){
            var json = JSON.parse(result);
            // Parse coins by key
            var coins_parsed = {};

            for (var i=0;i<json.length;i++) {
                var id = json[i]["symbol"].toLowerCase();
                coins_parsed[id] = json[i];
            }

            cb_func(coins_parsed);
        }});
    }
}