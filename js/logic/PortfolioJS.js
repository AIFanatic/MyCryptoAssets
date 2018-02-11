// Dependencies:
// - Database
// - Visual
// - Helpers
// - Explorers

function PortfolioJS() {
    self = this;

    this.SaveSettings = function(){
        var settings = Database.settings;

        for (var setting in settings) {
            var current_value = $("#settings-"+ setting +" option:selected").val();
            settings[setting] = current_value;
        }

        // Store
        Database.Save_Settings(settings)
    }

    this.DeleteAll = function(){
        this.DeleteCoins();
        this.DeleteTokens();
        this.Wallet_DeleteAll();
    }

    this.LoadCoins = function(forceReload=false, cb=false){
        if(!Database.allCoins || forceReload){
            this.Explorers.GetCoinsFromCMC(function(allCoins){
                // Loaded
                Database.Save_AllCoins(allCoins);
                Database.DB_Save("allCoins_epoch", new Date().getTime());

                self.Visual.LoadCoinsMenu(Database.allCoins);

                if(cb) cb();
            });
        }
        else{
            self.Visual.LoadCoinsMenu(Database.allCoins);

            if(cb) cb();
        }
    };

    this.DeleteCoins = function(){
        Database.DB_Delete("allCoins");
        Database.DB_Delete("allCoins_epoch");
    }

    this.LoadTokens = function(forceReload=false){
        console.log("Load Tokens");

        if( !Database.allTokens || forceReload){
            this.Explorers.GetTokensFromMEW(function(allTokens){
                Database.Save_AllTokens(allTokens);
                Database.DB_Save("allTokens_epoch", new Date().getTime());
            });
        }
    };

    this.DeleteTokens = function(){
        Database.DB_Delete("allTokens");
        Database.DB_Delete("allTokens_epoch");
    }

    this.LoadTickers = function(){
        for(coin in Database.allCoins){
            this.Visual.AddNewTicker(Database.allCoins[coin]);
        }
    };

    this.ReloadData = function(){
        console.log("Reloading data");

        this.Visual.LoadSettings(Database.settings);

        this.LoadCoins(true, function(){
            console.log("called");
            self.LoadTokens(true);
            self.Wallet_Load();
            self.Wallet_RefreshBalances();
        });
    }

    // END HELPERS

    // WALLET
    this.Wallet_DeleteAll = function(){
        Database.DB_Delete("wallet");
        Database.DB_Delete("wallet_info");
    }

    this.Wallet_AddNew = function (type, coin, currency) {
        console.log("CreateNew_Coin");

        var new_coin = {};

        var id = this.Helpers.GenRandomString(5);
        new_coin["name"] = mobi_coins_inst.getVal();
        new_coin["address"] = $("#watch-input-address").val();
        new_coin["currency"] = mobi_currency_inst.getVal();
        new_coin["symbol"] = Database.GetCoinValue(new_coin["name"], "symbol").toLowerCase();
        new_coin["balance"] = 0;
        // TODO: make currency dynamic
        new_coin["price"] = Database.GetCoinValue(new_coin["name"], "price_usd");

        console.log(new_coin);

        Database.Wallet_Add(id, new_coin);
        this.Visual.AddNewCoin(id, new_coin);

        this.Wallet_RefreshBalance(id);
    };

    this.Wallet_Delete = function(id){
        Database.Wallet_Remove(id);
        this.Visual.RemoveCoin(id);

        self.Wallet_RefreshCurrentTotal();
        self.Wallet_RefreshChangePer();
    }

    this.Wallet_RefreshBalance = function(id){
        console.log("Wallet_RefreshBalance");
        var new_coin = Database.my_wallet[id];

        this.Explorers.GetBalance(new_coin["address"], new_coin["name"], new_coin["symbol"], function(balance){
            new_coin["balance"] = balance; // Hackish
            Database.Wallet_UpdateBalance(id, balance);
            self.Visual.UpdateCoin(id, new_coin);

            self.Wallet_RefreshCurrentTotal();
            self.Wallet_RefreshChangePer();
        });
    }

    this.Wallet_RefreshBalances = function(id){
        console.log("Wallet_RefreshBalances");

        for(coin in Database.my_wallet){
            this.Wallet_RefreshBalance(coin);
        }

        Database.WalletInfo_UpdateWalletEpoch(this.Helpers.GetCurrentTime());        
    }

    // WALLET INFO
    this.Wallet_RefreshCurrentTotal = function(){
        var wallet_current_total = this.Wallet_GetTotalUSD();
        var wallet_previous_total = Database.my_wallet_info["prev_total_usd"];

        Database.WalletInfo_UpdateCurrentTotal(wallet_current_total);

        // Update previous balance if its 0
        if(wallet_previous_total==0){
            this.Wallet_RefreshPreviousTotal();
        }
        this.Visual.UpdateCurrentTotal(wallet_current_total);
    }

    // TODO: Should link previous total with change percentage into one function as they affect each other
    this.Wallet_RefreshPreviousTotal = function(){
        Database.WalletInfo_UpdatePreviousTotal();
        this.Wallet_RefreshChangePer();
    }

    this.Wallet_RefreshChangePer = function(){
        var wallet_change_per = this.Wallet_GetChangePer();

        this.Visual.UpdateCurrentChange(wallet_change_per);
    }

    
    this.Wallet_Load = function(){
        // TODO: Remove hard coded element class
        $(".coins-balance-list").html("");

        for(coin in Database.my_wallet){
            var new_coin = Database.my_wallet[coin];

            this.Visual.AddNewCoin(coin, new_coin);
            this.Visual.UpdateCoin(coin, new_coin);
        }

        // Update wallet total
        this.Wallet_RefreshCurrentTotal();
        this.Wallet_RefreshChangePer();
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

    this.Wallet_GetChangePer = function(){
        var change_per = this.Helpers.CalculateDiffPer(Database.my_wallet_info["prev_total_usd"], Database.my_wallet_info["current_total_usd"]);

        return change_per;
    }

    // END WALLET

    // TIMERS
    this.Timer_UpdateCoinData = function(){
        // Update coin names, token names and prices from CMC
        this.LoadCoins(true);
        this.LoadTokens(true);
    }

    this.Timer_UpdateWallet = function(){
        // Update wallet balances
        this.Wallet_RefreshBalances();
    }

    this.Timer_UpdateChangePer = function(){
        // Updates wallet info total percentage change
        this.Wallet_RefreshPreviousTotal();
    }
    // END TIMERS

    this.init = function(){
        this.Visual.LoadSettings(Database.settings);
        this.LoadCoins();
        this.LoadTokens();
        this.Wallet_Load();

        this.LoadTickers();
    }

    this.init();
}