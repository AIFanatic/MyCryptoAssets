var Templates = new function() {
    this.wallet_info = JSON.parse('{"current_total_usd":0,"prev_total_usd":0,"last_update_tickers_epoch":0,"last_update_portfolio_balances_epoch":0,"last_update_portfolio_metrics_epoch":0}');
    
    this.settings = JSON.parse('{"coins_max":"100", "refresh_tickers_sec":"86400","refresh_portfolio_balances_sec":"86400","refresh_portfolio_metrics_sec":"86400","currency_decimals":"2","crypto_decimals":"5","decimal_separator":".","thousands_separator":","}');

    this.neutral_color = "#000000de";
    this.positive_color = "#2ecc71";
    this.negative_color = "#e74c3c";
}