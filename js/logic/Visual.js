// Dependencies:
// - Database

PortfolioJS.prototype.Visual = new function(){

    // TODO: Call Helper functions from Helpers file
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

    this.ParseNumber = function(value, type){
        if(type=="currency"){
            return this.number_format(value, Database.settings["currency_decimals"], Database.settings["decimal_separator"], Database.settings["thousands_separator"]);
        }
        else if (type=="crypto"){
            return this.number_format(value, Database.settings["crypto_decimals"], Database.settings["decimal_separator"], Database.settings["thousands_separator"]);
        }
    }

    // End Helpers

    this.LoadSettings = function(settings){
        console.log(settings);
        for (var setting in settings) {
            var value = settings[setting];
            
            $("select[id$='settings-"+setting+"'] option[value='"+value+"']").attr("selected", true);
        }

        $('select').material_select();
    }

    this.LoadCoinsMenu = function(allCoins){
        console.log("LoadCoinNames");
        $("#coins_list").html("");

        for (var coin in allCoins) {
            var id = allCoins[coin]["id"];
            var name = allCoins[id]["name"];

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

    // TODO: Add this.ParseNumber to -price-text
    this.AddNewCoin = function(id, new_coin){
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
                    <span id="' + id + '-price-text" class="coin-name-sub">'+new_coin["price"] + " " + new_coin["currency"].toUpperCase() +'</span> \
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

    this.RemoveCoin = function(id){
        $("#"+id).fadeOut(250, function(){
            $("#"+id).remove();
        })
    }

    this.UpdateTokenList = function(id, data){
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

    this.UpdateCurrentTotal = function(amount){
        $("#wallet-current-total-usd").text( this.number_format(amount, 2, ".", ",") + " USD");
    }

    /*this.LoadWalletInfo = function(my_wallet_info){
        var total_usd = my_wallet_info["total_usd"];
        var prev_total_usd = my_wallet_info["prev_total_usd"];

        var change_per = this.number_format(((total_usd*100)/prev_total_usd)-100, 2);

        if(change_per==-100) change_per = 0;
        
        var change_per_arrow_html = "";
        
        if(change_per == 0 ) change_per_arrow_html = "";
        else if(change_per < 0 ) change_per_arrow_html = '<i class="material-icons">arrow_downward</i>';
        else if(change_per > 0 ) change_per_arrow_html = '<i class="material-icons">arrow_upward</i>';

        // TODO: Make currency dynamic
        $("#wallet-info-total_usd").text( this.number_format(total_usd, 2, ".", ",") + " USD");

        $("#wallet-info-change_per").html(change_per_arrow_html+change_per+" %");
    }*/

    this.UpdateCoin = function(id, coin_info){
        var wallet_coin_currency = coin_info["currency"].toUpperCase();
        var wallet_coin_name = coin_info["name"];
        var wallet_coin_balance = coin_info["balance"];

        var coin_symbol = Database.GetCoinValue(wallet_coin_name, "symbol").toUpperCase();
        var coin_price = Database.GetCoinValue(wallet_coin_name, "price_usd");

        $("#" + id + "-price-text").text(this.ParseNumber(coin_price, "currency")+" " + wallet_coin_currency);
        $("#" + id + "-currency-text").text(wallet_coin_currency);

        $("#" + id + "-balance-currency-text").text(this.ParseNumber(wallet_coin_balance*coin_price, "currency") + " " + wallet_coin_currency);
        $("#" + id + "-balance-crypto-text").text(this.ParseNumber(wallet_coin_balance, "crypto") + " " + coin_symbol);
    }

    // TODO: Lazy load images
    this.AddNewTicker = function(coin_info){
        $(".main-tickers-list").append('\
        <li class="waves-effect waves coin-list"> \
            <div class="col s12 m12 no-padding"> \
                <div class="col s3 m2 valign-wrapper no-padding center"> \
                    <div class="col s12 m12"> \
                    <img class="coin-img" src="https://files.coinmarketcap.com/static/img/coins/128x128/' + coin_info["id"] + '.png"> \
                    </div> \
                </div> \
                <div class="col s5 m6"> \
                    <span class="coin-name">'+ coin_info["name"] +'</span> \
                    <span class="coin-name-sub">'+this.ParseNumber(coin_info["market_cap_usd"], "currency") + " USD" +'</span> \
                </div> \
                <div class="col s4 m3 text-right"> \
                    <span class="coin-value">'+ this.ParseNumber(coin_info["price_usd"], "currency") +' USD</span> \
                    <span class="coin-value-sub">'+ coin_info["percent_change_24h"] +'%</span> \
                </div> \
            </div> \
        </li>');
    }
}