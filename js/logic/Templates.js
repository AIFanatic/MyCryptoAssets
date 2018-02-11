var Templates = new function() {
    this.wallet_info = JSON.parse('{"current_total_usd":0,"prev_total_usd":0,"last_update_total_epoch":0,"last_update_change_epoch":0,"last_update_wallet_epoch":0}');
    
    this.settings = JSON.parse('{"refresh_data_mins":"1440","refresh_wallet_metrics_mins":"1440","currency_decimals":"2","crypto_decimals":"5","decimal_separator":".","thousands_separator":","}');

    this.neutral_color = "#000000de";
    this.positive_color = "#2ecc71";
    this.negative_color = "#e74c3c";
}