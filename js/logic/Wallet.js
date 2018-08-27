PortfolioJS.prototype.Wallet = new function(){
    self = this;

    this.my_wallet = {};
    this.my_wallet_info = {};

    // Wallet
    this.Load_Wallet = function(){
        this.my_wallet = Database.DB_LoadJSON("wallet");

        if(!this.my_wallet){
            this.my_wallet = {}
            this.Save_Wallet(this.my_wallet);
        }
    }
    this.Save_Wallet = function(wallet){
        Database.DB_SaveJSON("wallet", wallet);
        this.Load_Wallet();
    }

    this.Load_WalletInfo = function(){
        this.my_wallet_info = Database.DB_LoadJSON("wallet_info");

        if(!this.my_wallet_info){
            this.my_wallet_info = Templates.wallet_info;
            this.Save_WalletInfo(this.my_wallet_info);
        }
    }

    this.Save_WalletInfo = function(wallet_info){
        Database.DB_SaveJSON("wallet_info", wallet_info);
        this.Load_Wallet();
    }

        
    // Wallet
    this.Add = function(id, data){
        this.my_wallet[id] = data;
        this.Save_Wallet(this.my_wallet);
    }

    this.Remove = function(id){
        delete this.my_wallet[id];
        this.Save_Wallet(this.my_wallet);
    }

    this.UpdateBalance = function(id, balance){
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




    this.DeleteAll = function(){
        Database.DB_Delete("wallet");
        Database.DB_Delete("wallet_info");
    }

    this.AddNew = function (type, coin, currency) {
        console.log("CreateNew_Coin");

        var new_coin = {};

        var id = Helpers.GenRandomString(5);
        new_coin["name"] = mobi_coins_inst.getVal();
        new_coin["address"] = $("#watch-input-address").val();
        new_coin["currency"] = mobi_currency_inst.getVal();
        new_coin["symbol"] = Database.GetCoinValue(new_coin["name"], "symbol").toLowerCase();
        new_coin["balance"] = 0;
        // TODO: make currency dynamic
        new_coin["price"] = Database.GetCoinValue(new_coin["name"], "price_usd");

        console.log(new_coin);

        this.Add(id, new_coin);
        Visual.AddNewCoin(id, new_coin);

        this.RefreshBalance(id);
    };

    this.Delete = function(id){
        this.Remove(id);
        Visual.RemoveCoin(id);

        this.RefreshCurrentTotal();
        this.RefreshChangePer();
    }

    this.RefreshBalance = function(id){
        console.log("Wallet_RefreshBalance");
        var new_coin = this.my_wallet[id];

        Explorers.GetBalance(new_coin["address"], new_coin["name"], new_coin["symbol"], function(balance){
            console.log(balance);
            new_coin["balance"] = balance; // Hackish
            self.Wallet.UpdateBalance(id, balance);
            Visual.UpdateCoin(id, new_coin);

            self.Wallet.RefreshCurrentTotal();
            self.Wallet.RefreshChangePer();
        });
    }

    this.RefreshBalances = function(id){
        console.log("Wallet_RefreshBalances");

        for(coin in Database.my_wallet){
            this.RefreshBalance(coin);
        }

        this.WalletInfo_UpdateWalletEpoch(Helpers.GetCurrentTime());        
    }

    // WALLET INFO
    this.RefreshCurrentTotal = function(){
        var wallet_current_total = this.GetTotalUSD();
        var wallet_previous_total = this.my_wallet_info["prev_total_usd"];

        this.WalletInfo_UpdateCurrentTotal(wallet_current_total);

        // Update previous balance if its 0
        if(wallet_previous_total==0){
            this.RefreshPreviousTotal();
        }
        Visual.UpdateCurrentTotal(wallet_current_total);
    }

    // TODO: Should link previous total with change percentage into one function as they affect each other
    this.RefreshPreviousTotal = function(){
        this.WalletInfo_UpdatePreviousTotal();
        this.RefreshChangePer();
    }

    this.RefreshChangePer = function(){
        var wallet_change_per = this.GetChangePer();

        Visual.UpdateCurrentChange(wallet_change_per);
    }

    
    this.Load = function(){
        // TODO: Remove hard coded element class
        $(".coins-balance-list").html("");

        console.log("Wallet load");
        for(coin in this.my_wallet){
            var new_coin = this.my_wallet[coin];

            Visual.AddNewCoin(coin, new_coin);
            Visual.UpdateCoin(coin, new_coin);
        }

        // Update wallet total
        this.RefreshCurrentTotal();
        this.RefreshChangePer();
    }

    this.GetTotalUSD = function(){
        var total = 0;

        for(coin in this.my_wallet){
            var coin_price_usd = this.my_wallet[coin]["price"];
            var coin_balance = this.my_wallet[coin]["balance"];

            total+=coin_price_usd*coin_balance;
        }

        return total;
    }

    this.GetChangePer = function(){
        var change_per = Helpers.CalculateDiffPer(this.my_wallet_info["prev_total_usd"], this.my_wallet_info["current_total_usd"]);

        return change_per;
    }


    
    this.Init = function(){
        this.Load_Wallet();
        this.Load_WalletInfo();
        this.Load();
    }

    this.Init();
}