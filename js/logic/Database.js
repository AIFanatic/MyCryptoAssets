var Database = new function() {
    this.my_wallet = {};

    this.allCoins = [];
    this.allTokens = [];

    // URLs / BC explorers / TODO: port to outside
    this.token_query_url = "http://localhost/portfolio/starter/token_cmc.php"; // Hackish and only required backend, TODO: Remove backend
    this.tickers_url = "https://api.coinmarketcap.com/v1/ticker/";
    this.tokens_url = "https://raw.githubusercontent.com/kvhnuke/etherwallet/mercury/app/scripts/tokens/ethTokens.json";
    this.tokens_contract_info = "https://api.ethplorer.io/getTokenInfo/"; // add "?apiKey=freekey" to the end

    // Settings
    this.settings = {};

    // LOAD/SAVE
    // All coins
    this.Load_AllCoins = function(){
        this.allCoins = Storage.Get_AllCoins();
    }
    this.Save_AllCoins = function(coins){
        Storage.Set_AllCoins(coins);
        this.Load_AllCoins();
    }

    // All tokens
    this.Load_AllTokens = function(){
        this.allTokens = Storage.Get_AllTokens();
    }
    this.Save_AllTokens = function(tokens){
        Storage.Set_AllTokens(tokens);
        this.Load_AllTokens();
    }

    // Wallet
    this.Load_Wallet = function(){
        this.my_wallet = Storage.Get_Wallet();
    }
    this.Save_Wallet = function(wallet){
        Storage.Set_Wallet(wallet);
        this.Load_Wallet();
    }

    // Settings
    this.Load_Settings = function(){
        this.settings = Storage.Get_Settings();

        if(!this.settings){
            this.settings = Templates.settings;
            this.Save_Settings(this.settings);
        }
    }
    this.Save_Settings = function(settings){
        Storage.Set_Settings(settings);
        this.Load_Settings();
    }
    // END LOAD/SAVE

    // WALLET FUNCTIONS
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
    // END WALLET FUNCTIONS

    this.Init = function(){
        this.Load_AllCoins();
        this.Load_AllTokens();
        
        this.Load_Wallet();
        this.Load_Settings();

        console.log("called");
    }

    this.Init();
}