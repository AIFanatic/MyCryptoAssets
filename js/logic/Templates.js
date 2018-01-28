var Templates = new function() {
    this.wallet_info = JSON.parse('{"total_usd":0,"prev_total_usd":0,"last_update_tickers_milis":0,"last_update_metrics_milis":0}');
    
    this.settings = JSON.parse('{"refresh_data_mins":"1440","refresh_wallet_metrics_mins":"1440","currency_decimals":"2","crypto_decimals":"5","decimal_separator":".","thousands_separator":","}');
}