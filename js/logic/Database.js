// Dependencies:
//

var Database = new function() {
    this.my_wallet = {};
    this.my_wallet_info = {};

    this.allCoins = [];
    this.allTokens = [];
    this.settings = {};

    // URLs / BC explorers / TODO: port to outside
    this.token_query_url = "http://localhost/portfolio/starter/token_cmc.php"; // Hackish and only required backend, TODO: Remove backend
    this.tickers_url = "https://api.coinmarketcap.com/v1/ticker/";
    this.tokens_url = "https://raw.githubusercontent.com/kvhnuke/etherwallet/mercury/app/scripts/tokens/ethTokens.json";
    this.tokens_contract_info = "https://api.ethplorer.io/getTokenInfo/"; // add "?apiKey=freekey" to the end

    // LocalStorage
    this.DB_Save = function(name, value){
        localStorage.setItem(name, value);
    }
    this.DB_Load = function(name){
        var data = localStorage.getItem(name);
        if(data)
            return data;

        return null;
    }

    this.DB_Delete = function(name){
        localStorage.removeItem(name);
    }

    this.DB_DeleteAll = function(){
        localStorage.clear();
    }

    this.DB_SaveJSON = function(name, valueJSON){
        localStorage.setItem(name, JSON.stringify(valueJSON));
    }

    this.DB_LoadJSON = function(name){
        var data = localStorage.getItem(name);
        if(data){
            return JSON.parse(data);
        }
        return null;
    }
    // END LocalStorage

    // LOAD/SAVE
    // All coins
    this.Load_AllCoins = function(){
        this.allCoins = this.DB_LoadJSON("allCoins");
    }
    this.Save_AllCoins = function(coins){
        this.DB_SaveJSON("allCoins", coins);
        this.Load_AllCoins();
    }

    // All tokens
    this.Load_AllTokens = function(){
        this.allTokens = this.DB_LoadJSON("allTokens");
    }
    this.Save_AllTokens = function(tokens){
        this.DB_SaveJSON("allTokens", tokens);
        this.Load_AllTokens();
    }

    // Wallet
    this.Load_Wallet = function(){
        this.my_wallet = this.DB_LoadJSON("wallet");

        if(!this.my_wallet){
            this.my_wallet = {}
            this.Save_Wallet(this.my_wallet);
        }
    }
    this.Save_Wallet = function(wallet){
        this.DB_SaveJSON("wallet", wallet);
        this.Load_Wallet();
    }

    this.Load_WalletInfo = function(){
        this.my_wallet_info = this.DB_LoadJSON("wallet_info");

        if(!this.my_wallet_info){
            this.my_wallet_info = Templates.wallet_info;
            this.Save_WalletInfo(this.my_wallet_info);
        }
    }

    this.Save_WalletInfo = function(wallet_info){
        this.DB_SaveJSON("wallet_info", wallet_info);
        this.Load_Wallet();
    }



    // Settings
    this.Load_Settings = function(){
        this.settings = this.DB_LoadJSON("settings");

        if(!this.settings){
            this.settings = Templates.settings;
            this.Save_Settings(this.settings);
        }
    }
    this.Save_Settings = function(settings){
        this.DB_SaveJSON("settings", settings);
        this.Load_Settings();
    }
    // END LOAD/SAVE

    // COINS
    this.GetCoinValue = function(id, value){
        if(this.allCoins[id] !== undefined && this.allCoins[id][value] !== undefined){
            return this.allCoins[id][value];
        }
        return false;
    };
    // END COINS

    // WALLET FUNCTIONS

    // Wallet
    this.Wallet_Add = function(id, data){
        this.my_wallet[id] = data;
        this.Save_Wallet(this.my_wallet);
    }

    this.Wallet_Remove = function(id){
        delete this.my_wallet[id];
        this.Save_Wallet(this.my_wallet);
    }

    this.Wallet_UpdateBalance = function(id, balance){
        this.my_wallet[id]["balance"] = balance;
        this.Save_Wallet(this.my_wallet);
    }

    // Wallet Info
    this.WalletInfo_UpdateCurrentTotal = function(amount){
        this.my_wallet_info["current_total_usd"] = amount;
        this.my_wallet_info["last_update_total_epoch"] = new Date().getTime();
        this.Save_WalletInfo(this.my_wallet_info);
    }

    this.WalletInfo_UpdatePreviousTotal = function(){
        this.my_wallet_info["prev_total_usd"] = this.my_wallet_info["current_total_usd"];
        this.my_wallet_info["last_update_change_epoch"] = new Date().getTime();
        this.Save_WalletInfo(this.my_wallet_info);
    }

    // Wallet Info Epochs
    this.WalletInfo_UpdateChangeEpoch = function(time){
        this.my_wallet_info["last_update_change_epoch"] = time;
        this.Save_WalletInfo(this.my_wallet_info);
    }

    this.WalletInfo_UpdateWalletEpoch = function(time){
        this.my_wallet_info["last_update_wallet_epoch"] = time;
        this.Save_WalletInfo(this.my_wallet_info);
    }



    // END WALLET FUNCTIONS

    this.Init = function(){
        this.Load_AllCoins();
        this.Load_AllTokens();
        
        this.Load_Wallet();
        this.Load_WalletInfo();
        this.Load_Settings();

        console.log("called");
    }

    this.Init();
}