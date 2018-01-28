function PortfolioJS() {
    self = this;

    // URLs / BC explorers / TODO: port to outside
    this.tickers_url = "https://api.coinmarketcap.com/v1/ticker/";
    this.tokens_url = "https://raw.githubusercontent.com/kvhnuke/etherwallet/mercury/app/scripts/tokens/ethTokens.json";

    this.ParseNumber = function(value, type){
        if(type=="currency"){
            return this.Helpers.number_format(value, Database.settings["currency_decimals"], Database.settings["decimal_separator"], Database.settings["thousands_separator"]);
        }
        else if (type=="crypto"){
            return this.Helpers.number_format(value, Database.settings["crypto_decimals"], Database.settings["decimal_separator"], Database.settings["thousands_separator"]);
        }
    }

    this.GetCoinValue = function(id, value){
        if(Database.allCoins[id] !== undefined && Database.allCoins[id][value] !== undefined){
            return Database.allCoins[id][value];
        }
        return false;
    };

    this.SaveSettings = function(){
        var settings = Database.settings;

        for (var setting in settings) {
            var current_value = $("#settings-"+ setting +" option:selected").val();
            settings[setting] = current_value;
        }

        // Store
        Database.Save_Settings(settings)
    }

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

                Storage.Set_AllCoins_epoch(new Date().getTime());
                Database.Save_AllCoins(coins_parsed);

                // Loaded
                self.Visual.LoadCoinsMenu(Database.allCoins);

                if(cb) cb();
            }});
        }
        else{
            // Loaded
            self.Visual.LoadCoinsMenu(Database.allCoins);

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

                Storage.Set_AllTokens_epoch(new Date().getTime());
                Database.Save_AllTokens(coins_parsed);
            }});
        }
        /*else{
            self.allTokens = Storage.Get_AllTokens();
        }*/
    };

    this.ReloadData = function(){
        console.log("Reloading data");

        this.Visual.LoadSettings(Database.settings);

        this.LoadCoins(true, function(){
            console.log("called");
            self.LoadTokens(true);
            self.Wallet_Load();
            self.Wallet_RefreshBalances();
            self.Wallet_RefreshWalletMetrics();
        });
    }

    // END HELPERS

    // VISUAL
    this.Visual_UpdateCoin = function(id){
        var wallet_coin = Database.my_wallet[id];
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

    // WALLET
    this.Wallet_AddNew = function (type, coin, currency) {
        console.log("CreateNew_Coin");

        var new_coin = {};

        var id = this.Helpers.GenRandomString(5);
        new_coin["name"] = mobi_coins_inst.getVal();
        new_coin["address"] = $("#watch-input-address").val();
        new_coin["currency"] = mobi_currency_inst.getVal();
        new_coin["symbol"] = this.GetCoinValue(new_coin["name"], "symbol").toLowerCase();
        new_coin["balance"] = 0;
        // TODO: make currency dynamic
        new_coin["price"] = this.GetCoinValue(new_coin["name"], "price_usd");

        console.log(new_coin);

        Database.Wallet_Add(id, new_coin);
        this.Visual.AddNewCoin(id, new_coin);

        this.Wallet_GetAndUpdateCoinBalance(id);
    };

    // Helper used to get and update a coin balance
    // Required since there are several checks to be made
    this.Wallet_GetAndUpdateCoinBalance = function(id){
        var new_coin = Database.my_wallet[id];

        this.Explorers.GetBalance(new_coin["address"], new_coin["name"], new_coin["symbol"], function(balance){
            self.Wallet_UpdateBalance(id, balance);
        });
    }

    this.Wallet_UpdateBalance = function(id, balance){
        Database.Wallet_UpdateBalance(id, balance);
        this.Visual_UpdateCoin(id);
    }

    this.Wallet_Delete = function(id){
        Database.Wallet_Remove(id);
        this.Visual.RemoveCoin(id);
    }

    this.Wallet_RefreshBalances = function(){
        for(coin in Database.my_wallet){
            this.Wallet_GetAndUpdateCoinBalance(coin);
        }
    }
    
    this.Wallet_Load = function(){
        // TODO: Remove hard coded element class
        $(".coins-balance-list").html("");

        for(coin in Database.my_wallet){
            var new_coin = Database.my_wallet[coin];

            this.Visual.AddNewCoin(coin, new_coin);
            this.Visual_UpdateCoin(coin);
        }
    }

    this.Wallet_GetTotalUSD = function(){
        var total = 0;

        for(coin in Database.my_wallet){
            var coin_price_usd = Database.my_wallet[coin]["price"];
            var coin_balance = Database.my_wallet[coin]["balance"];

            total+=coin_price_usd*coin_balance;
        }

        return total;
    }

    // END WALLET

    // END TIMERS

    this.init = function(){
        this.Visual.LoadSettings(Database.settings);
        this.LoadCoins();
        this.LoadTokens();
        this.Wallet_Load();
    }

    this.init();
}