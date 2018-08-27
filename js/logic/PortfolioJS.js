// Dependencies:
// - Database
// - Visual
// - Helpers
// - Explorers

function PortfolioJS() {
    self = this;

    this.DeleteAll = function(){
        this.DeleteSettings();
        this.DeleteCoins();
        this.DeleteTokens();
        this.Wallet.DeleteAll();

        location.reload();
    }

    this.DeleteSettings = function(){
        Database.DB_Delete("settings");
    }

    this.SaveSettings = function(){
        var settings = Database.settings;

        for (var setting in settings) {
            var current_value = $("#settings-"+ setting +" option:selected").val();
            settings[setting] = current_value;
        }

        // Store
        Database.Save_Settings(settings)
    }

    this.LoadCoins = function(forceReload=false, cb=false){
        if(!Database.allCoins || forceReload){
            Explorers.GetCoinsFromCMC(function(allCoins){
                // Loaded
                Database.Save_AllCoins(allCoins);
                Database.DB_Save("allCoins_epoch", new Date().getTime());

                Visual.LoadCoinsMenu(Database.allCoins);

                if(cb) cb();
            });
        }
        else{
            Visual.LoadCoinsMenu(Database.allCoins);

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
            Explorers.GetTokensFromMEW(function(allTokens){
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
            Visual.AddNewTicker(Database.allCoins[coin]);
        }
    };

    this.ReloadData = function(){
        console.log("Reloading data");

        Visual.LoadSettings(Database.settings);

        this.LoadCoins(true, function(){
            console.log("called");
            self.LoadTokens(true);
            self.Wallet.Load();
            self.Wallet.RefreshBalances();
        });
    }

    // END HELPERS

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
        Visual.LoadSettings(Database.settings);
        this.LoadCoins();
        this.LoadTokens();

        this.LoadTickers();
    }

    this.init();
}