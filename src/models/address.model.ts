export type AddressWrapper = {
  address_book: {
    [key: string]: Address;
  };
  summary: {
    fan: number;
    standard: number;
  };
  galaxy_path: string;
};

export type Address = {
  name: string;
  gate_address: number[];
  ip_address: string;
  is_gate_online: '0' | '1';
  is_black_hole: boolean;
  type: 'standard' | 'fan';
} & AddressCustom;

type AddressCustom = {
  htmlData?: Element;
};
