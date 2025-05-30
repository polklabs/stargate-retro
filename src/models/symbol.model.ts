export type Symbol = {
  index: number;
  keyboard_mapping: string | false;
  name: string;
  imageSrc: string;
  is_on_dhd?: boolean;
} & SymbolCustom;

type SymbolCustom = {
  imageData?: string;
};
