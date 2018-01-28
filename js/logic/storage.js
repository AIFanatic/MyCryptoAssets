var Storage = new function() {

    // Coins
    this.Set_AllCoins_epoch = function(epoch){
        localStorage.setItem("allCoins_epoch", epoch);
    };

    this.Get_AllCoins_epoch = function(){
        var data = localStorage.getItem("allCoins_epoch");

        if(data)
            return data;
        
        return 0;
    };

    this.Set_AllCoins = function(coins_data){
        localStorage.setItem("allCoins", JSON.stringify(coins_data));
    };

    this.Get_AllCoins = function(){
        var data = localStorage.getItem("allCoins");
        if(data){
            return JSON.parse(data);
        }
        return null;
    };
    // End coin

    // Tokens
    this.Set_AllTokens_epoch = function(epoch){
        localStorage.setItem("allTokens_epoch", epoch);
    };

    this.Get_AllTokens_epoch = function(){
        var data = localStorage.getItem("allTokens_epoch");

        if(data)
            return data;
        
        return 0;
    };

    this.Set_AllTokens = function(coins_data){
        localStorage.setItem("allTokens", JSON.stringify(coins_data));
    };

    this.Get_AllTokens = function(){
        var data = localStorage.getItem("allTokens");
        if(data){
            return JSON.parse(data);
        }
        return null;
    };
    // End tokens

    // Wallet
    this.Set_Wallet = function(data){
        localStorage.setItem("wallet", JSON.stringify(data));
    };

    this.Get_Wallet = function(){
        var data = localStorage.getItem("wallet");
        if(data){
            return JSON.parse(data);
        }
        return null;
    };

    this.Set_Wallet_Info = function(data){
        localStorage.setItem("wallet_info", JSON.stringify(data));
    };

    this.Get_Wallet_Info = function(){
        var data = localStorage.getItem("wallet_info");
        if(data && data.constructor === Object){
            return JSON.parse(data);
        }
        return null;
    };

    this.Set_Settings = function(data){
        localStorage.setItem("settings", JSON.stringify(data));
    };

    this.Get_Settings = function(){
        var data = localStorage.getItem("settings");
        if(data){
            return JSON.parse(data);
        }
        return null;
    };
    // End wallet
};