function PortfolioJS() {
    self = this;

    // Internal data
    this.my_coins = {};
    this.allCoins = [];
    this.allTokens = [];

    // URLs / BC explorers / TODO: port to outside
    this.token_query_url = "http://localhost/portfolio/starter/token_cmc.php"; // Hackish and only required backend, TODO: Remove backend
    this.tickers_url = "https://api.coinmarketcap.com/v1/ticker/";
    this.tokens_url = "https://raw.githubusercontent.com/kvhnuke/etherwallet/mercury/app/scripts/tokens/ethTokens.json";
    this.tokens_contract_info = "https://api.ethplorer.io/getTokenInfo/"; // add "?apiKey=freekey" to the end

    // Settings
    this.settings = {};

    // GENERAL
    this.GenRandomString = function(len){
        return Math.random().toString(36).substring(2, len) + Math.random().toString(36).substring(2, len);
    };
    // END GENERAL

    // HELPERS
    this.number_format = function number_format(number, decimals, decPoint, thousandsSep) {
        number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
        var n = !isFinite(+number) ? 0 : +number
        var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
        var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
        var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
        var s = ''
        var toFixedFix = function(n, prec) {
            var k = Math.pow(10, prec)
            return '' + (Math.round(n * k) / k)
                .toFixed(prec)
        }
        // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || ''
            s[1] += new Array(prec - s[1].length + 1).join('0')
        }
        return s.join(dec)
    }

    this.LoadSettings = function(){
        var settings = Storage.Get_Settings();

        if(!settings){
            // Settings not found, create blank
            settings = {};
            settings["refresh_interval_mins"] = 1440;
            settings["currency_decimals"] = 2;
            settings["crypto_decimals"] = 5;
            settings["decimal_separator"] = ".";
            settings["thousands_separator"] = ",";

            Storage.Set_Settings(settings);
        }

        this.settings = settings;

        this.Visual_LoadSettings();

        return settings;
    }

    this.SaveSettings = function(){
        var settings = this.settings;

        for (var setting in settings) {
            var current_value = $("#settings-"+ setting +" option:selected").val();

            settings[setting] = current_value;
        }

        // Store
        Storage.Set_Settings(settings);
    }

    this.ParseNumber = function(value, type){
        if(type=="currency"){
            return this.number_format(value, this.settings["currency_decimals"], this.settings["decimal_separator"], this.settings["thousands_separator"]);
        }
        else if (type=="crypto"){
            return this.number_format(value, this.settings["crypto_decimals"], this.settings["decimal_separator"], this.settings["thousands_separator"]);
        }
    }

    this.GetCoinValue = function(id, value){
        if(this.allCoins[id] !== undefined && this.allCoins[id][value] !== undefined){
            return this.allCoins[id][value];
        }
        return false;
    };

    this.LoadCoins = function(force=false, cb=false){
        console.log("Load coins");
        var current_time = new Date().getTime();

        var coins_epoch = Storage.Get_AllCoins_epoch();

        console.log((current_time-coins_epoch)/1000);

        if( (current_time-coins_epoch)/1000 > (7*24*60*60) || force){
            $.ajax({url: this.tickers_url, success: function(result){
                // Parse coins by key
                var coins_parsed = {};

                for (var i=0;i<result.length;i++) {
                    var id = result[i]["id"];
                    coins_parsed[id] = result[i];
                }

                Storage.Set_AllCoins(coins_parsed);
                Storage.Set_AllCoins_epoch(new Date().getTime());
                self.allCoins = Storage.Get_AllCoins();

                // Loaded
                self.Visual_LoadCoinsMenu();

                if(cb) cb();
            }});
        }
        else{
            self.allCoins = Storage.Get_AllCoins();

            // Loaded
            self.Visual_LoadCoinsMenu();

            if(cb) cb();
        }
    };

    this.LoadTokens = function(force=false){
        console.log("Load Tokens");
        var current_time = new Date().getTime();

        var coins_epoch = Storage.Get_AllTokens_epoch();

        if( (current_time-coins_epoch)/1000 > (7*24*60*60) || force){
            $.ajax({url: this.tokens_url, success: function(result){
                var json = JSON.parse(result);
                // Parse coins by key
                var coins_parsed = {};

                for (var i=0;i<json.length;i++) {
                    var id = json[i]["symbol"].toLowerCase();
                    coins_parsed[id] = json[i];
                }

                Storage.Set_AllTokens(coins_parsed);
                Storage.Set_AllTokens_epoch(new Date().getTime());
                self.allTokens = Storage.Get_AllTokens();
            }});
        }
        else{
            self.allTokens = Storage.Get_AllTokens();
        }
    };

    this.ReloadData = function(){
        this.LoadSettings();
        this.LoadCoins(true, function(){
            console.log("called");
            self.LoadTokens(true);
            self.Wallet_Load();
            self.Wallet_RefreshBalances();
        });
    }

    // ----- TOKENS

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
        if( this.allTokens[symbol.toLowerCase()] !== undefined)
            return true;

        return false;
    }
    
    this.GetTokensList = function(name, cb){
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

    this.GetTokenBalance = function(address, contractAddress, contractDecimals, cb){
        Explorers.GetTokenBalance(address, contractAddress, contractDecimals, function(balance){
            cb(balance);
        });
    }

    this.GetTokenInfo = function(address, cb){
        var url = this.tokens_contract_info+address+"?apiKey=freekey";

        $.ajax({url: url, success: function(result){
            cb(result);
        }});
    }

    this.TokenListClick = function(data){
        var data_arr = data.split("-");
        var id = data_arr[0];
        var new_coin = this.my_coins[id];

        var address = new_coin["address"];
        var contractAddress = data_arr[1];

        this.GetTokenInfo(contractAddress, function(result){
            var json = JSON.parse(result);
            var contractDecimals = json["decimals"];

            self.GetTokenBalance(address, contractAddress, contractDecimals, function(balance){
                self.Wallet_UpdateBalance(id, balance);
            });
        });
    }

    // This function checks if the token is on MEW list
    // If not on MEW list it uses either CMC backend or Etherscan to find the contract info
    // TODO: Currently backend url is hardcoded, maybe add to settings?
    this.HandleToken = function(id, new_coin){
        if(!this.isOnTokenList(new_coin["symbol"])){
            // Not on MEW list, search and let user choose token contract
            this.GetTokensList(new_coin["name"], function(data){
                if(data.length==1){
                    // Only got one address back, no need to show contract list
                    // TODO: Shouldn't need to build string in this case
                    var data_str = id+"-"+data[0]["address"];
                    self.TokenListClick(data_str);
                }
                else{
                    // Found more than 1 contract, let user choose which
                    self.Visual_UpdateTokenList(id, data);
                    mobi_token_list.show();
                }
            });
        }
        else{
            // Is on MEW list
            var contractAddress = this.allTokens[new_coin["symbol"]]["address"];
            var contractDecimals = this.allTokens[new_coin["symbol"]]["decimal"];

            this.GetTokenBalance(new_coin["address"], contractAddress, contractDecimals, function(balance){
                console.log(balance);
                self.Wallet_UpdateBalance(id, balance);
            });
        }
    }

    // ----- END TOKENS

    // END HELPERS

    // VISUAL
    this.Visual_LoadSettings = function(){
        for (var setting in this.settings) {
            var value = this.settings[setting];
            
            $("select[id$='settings-"+setting+"'] option[value='"+value+"']").attr("selected", true);
        }

        $('select').material_select();
    }

    this.Visual_LoadCoinsMenu = function(){
        console.log("LoadCoinNames");
        $("#coins_list").html("");

        var allCoins = this.allCoins;
        
        for (var coin in allCoins) {
            var id = allCoins[coin]["id"];
            var name = this.GetCoinValue(id, "name");

            if(isNaN(name)){

                var first_letter = id.slice(0, 1);

                var coin_html = '<option style="background-image: url(https://files.coinmarketcap.com/static/img/coins/32x32/bitcoin-cash.png)" value="' + id + '">' + name + '</option>';

                var coin_group = $(".list-group-" + first_letter);

                if (coin_group.length > 0) {
                    coin_group.append(coin_html);
                } else {
                    $("#coins_list").append('<optgroup class="list-group-' + first_letter + '" label="' + first_letter.toUpperCase() + '">' + coin_html + '</optgroup>');
                }

                // Setup coin background
                coin_style.append('[data-val="' + id + '"] .dw-i{ background-image: url(https://files.coinmarketcap.com/static/img/coins/32x32/' + id + '.png); }');
            }
        }

        // Update sheet
        document.head.appendChild(coin_style);
    };

    this.Visual_AddNewCoin = function(id, new_coin){
        $(".coins-balance-list").append('\
        <li id="'+ id +'" class="waves-effect waves coin-list"> \
            <div class="col s12 m12 no-padding"> \
                <div class="col s3 m2 valign-wrapper no-padding center"> \
                    <div class="col s12 m12"> \
                    <img class="coin-img" src="https://files.coinmarketcap.com/static/img/coins/128x128/' + new_coin["name"] + '.png"> \
                    </div> \
                </div> \
                <div class="col s5 m6"> \
                    <span class="coin-name">'+ new_coin["name"] +'</span> \
                    <span id="' + id + '-price-text" class="coin-name-sub">'+this.ParseNumber(new_coin["price"], "currency") + " " + new_coin["currency"].toUpperCase() +'</span> \
                </div> \
                <div class="col s4 m3 text-right"> \
                    <span id="' + id + '-balance-currency-text" class="coin-value">Loading...</span> \
                    <span id="' + id + '-balance-crypto-text" class="coin-value-sub">Loading...</span> \
                </div> \
                <div class="col s8 m3 info-box" id="'+ id +'-info"> \
                    <a href="#" class="view-btn waves-effect waves" id="'+ id +'-view"><i class="material-icons">remove_red_eye</i></a> \
                    <a href="#" class="refresh-btn waves-effect waves" id="'+ id +'-refresh"><i class="material-icons">refresh</i></a> \
                    <a href="#" class="delete-btn waves-effect waves" id="'+ id +'-delete"><i class="material-icons">delete</i></a> \
                </div> \
            </div> \
        </li>');
    }

    this.Visual_RemoveCoin = function(id){
        $("#"+id).fadeOut(250, function(){
            $("#"+id).remove();
        })
    }

    this.Visual_UpdateTokenList = function(id, data){
        $("#token_list").html("");
        var html = "";

        for(coin in data){
            console.log(data);
            var name = data[coin]["name"];
            var address = data[coin]["address"];

            // Format id-contractAddress, id is current DB id, so it can be updated later
            html+= '<optgroup label="'+name+'">';
                html+= '<option value="'+id+"-"+address+'">'+address+'</option>';
            html+= '</optgroup>';
        }

        $("#token_list").html(html);
    }

    this.Visual_UpdateCoin = function(id){
        var wallet_coin = this.my_coins[id];
        var wallet_coin_currency = wallet_coin["currency"].toUpperCase();
        var wallet_coin_name = wallet_coin["name"];
        var wallet_coin_balance = wallet_coin["balance"];

        var coin_symbol = this.GetCoinValue(wallet_coin_name, "symbol").toUpperCase();
        var coin_price = this.GetCoinValue(wallet_coin_name, "price_usd");

        $("#" + id + "-price-text").text(this.ParseNumber(coin_price, "currency")+" " + wallet_coin_currency);
        $("#" + id + "-currency-text").text(wallet_coin_currency);

        $("#" + id + "-balance-currency-text").text(this.ParseNumber(wallet_coin_balance*coin_price, "currency") + " " + wallet_coin_currency);
        $("#" + id + "-balance-crypto-text").text(this.ParseNumber(wallet_coin_balance, "crypto") + " " + coin_symbol);
    }
    // END VISUAL

    // DATABASE
    this.DB_AddCoin = function(id, data){
        this.my_coins[id] = data;
    }

    this.DB_RemoveCoin = function(id){
        delete this.my_coins[id];
    }

    this.DB_UpdateCoinBalance = function(id, balance){
        this.my_coins[id]["balance"] = balance;
    }
    // END DATABASE

    // WALLET
    this.Wallet_AddNew = function (type, coin, currency) {
        console.log("CreateNew_Coin");

        var new_coin = {};

        var id = this.GenRandomString(5);
        new_coin["name"] = mobi_coins_inst.getVal();
        new_coin["address"] = $("#watch-input-address").val();
        new_coin["currency"] = mobi_currency_inst.getVal();
        new_coin["symbol"] = this.GetCoinValue(new_coin["name"], "symbol").toLowerCase();
        new_coin["balance"] = 0;
        // TODO: make currency dynamic
        new_coin["price"] = this.GetCoinValue(new_coin["name"], "price_usd");

        console.log(new_coin);

        this.Visual_AddNewCoin(id, new_coin);
        this.DB_AddCoin(id, new_coin);

        this.Wallet_GetAndUpdateCoinBalance(id);
    };

    // Helper used to get and update a coin balance
    // Required since there are several checks to be made
    this.Wallet_GetAndUpdateCoinBalance = function(id){
        var new_coin = this.my_coins[id];

        // Check if coin is a token
        var isToken = this.isToken(new_coin["name"], new_coin["symbol"], new_coin["address"]);

        if(isToken){
            // Need a helper here since it may not be on MEW list
            this.HandleToken(id, new_coin);
        }
        else{
            Explorers.GetBalance(new_coin["address"], new_coin["name"], new_coin["symbol"], function(balance){
                self.Wallet_UpdateBalance(id, balance);
            });
        }
    }

    this.Wallet_UpdateBalance = function(id, balance){
        this.DB_UpdateCoinBalance(id, balance);
        this.Visual_UpdateCoin(id);

        this.Wallet_Save();
    }

    this.Wallet_Delete = function(id){
        this.DB_RemoveCoin(id);
        this.Visual_RemoveCoin(id);

        this.Wallet_Save();
    }

    this.Wallet_Save = function(){
        Storage.Set_Wallet(this.my_coins);
    }

    this.Wallet_Get = function(){
        return Storage.Get_Wallet();
    }

    this.Wallet_RefreshBalances = function(){
        var wallet = this.Wallet_Get();
        this.my_coins = wallet;

        for(coin in wallet){
            portfolioJS.Wallet_GetAndUpdateCoinBalance(coin);
        }
    }
    
    this.Wallet_Load = function(){
        // TODO: Remove hard coded element class
        $(".coins-balance-list").html("");

        var wallet = this.Wallet_Get();
        this.my_coins = wallet;

        for(coin in wallet){
            var new_coin = wallet[coin];

            this.Visual_AddNewCoin(coin, new_coin);
            this.Visual_UpdateCoin(coin);
        }
    }

    // END WALLET

    this.init = function(){
        this.LoadSettings();
        this.LoadCoins();
        this.LoadTokens();
        this.Wallet_Load();
    }

    this.init();
}