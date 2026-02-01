export interface GoPlusResponse {
  code: number;
  message: string;
  result: {
    [tokenAddress: string]: GoPlusTokenData;
  };
}

export interface GoPlusTokenData {
  is_honeypot?: string;
  buy_tax?: string;
  sell_tax?: string;
  transfer_pausable?: string;
  is_blacklisted?: string;
  is_open_source?: string;
  is_proxy?: string;
  can_take_back_ownership?: string;
  owner_change_balance?: string;
  hidden_owner?: string;
  selfdestruct?: string;
  external_call?: string;
  is_mintable?: string;
  slippage_modifiable?: string;
  trading_cooldown?: string;
  is_anti_whale?: string;
  anti_whale_modifiable?: string;
  cannot_buy?: string;
  cannot_sell_all?: string;
  holder_count?: string;
  total_supply?: string;
  holders?: GoPlusHolder[];
  lp_holders?: GoPlusLPHolder[];
  lp_total_supply?: string;
  is_true_token?: string;
  is_airdrop_scam?: string;
  trust_list?: string;
  other_potential_risks?: string;
  note?: string;
  fake_token?: {
    value: number;
    is_fake_token: boolean;
  };
  token_name?: string;
  token_symbol?: string;
}

export interface GoPlusHolder {
  address: string;
  tag?: string;
  is_contract?: number;
  balance: string;
  percent: string;
  is_locked?: number;
}

export interface GoPlusLPHolder {
  address: string;
  tag?: string;
  is_contract?: number;
  balance: string;
  percent: string;
  is_locked?: number;
  locked_detail?: {
    amount: string;
    end_time: string;
    opt_time: string;
  }[];
}
