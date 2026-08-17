// Regras padrão de categorização por palavra-chave no título do lançamento.
// A ordem importa: a primeira regra que combinar vence.
// Sinta-se à vontade para editar/adicionar regras aqui — elas valem para todo mundo
// que usar este app. Correções feitas na tela (mudar a categoria de um item) são
// salvas por estabelecimento no navegador e têm prioridade sobre estas regras.

export const CATEGORY_STYLE = {
  "Alimentação/Lazer": { bg: "#FDF0E7", fg: "#B2560D", dot: "#E8804F" },
  "Transporte": { bg: "#EAF1FB", fg: "#1D4F91", dot: "#3E7CC7" },
  "Vestuário/Compras": { bg: "#F5EEFB", fg: "#6A3399", dot: "#9B5FD6" },
  "Praia/Lazer": { bg: "#E8F6F3", fg: "#0C6B5E", dot: "#1E9E8A" },
  "Saúde": { bg: "#FDECEC", fg: "#B23A3A", dot: "#DD6363" },
  "Compras Online": { bg: "#EFEEFB", fg: "#4A3F9E", dot: "#7A6FD6" },
  "Viagem": { bg: "#E9F4FB", fg: "#1B6B93", dot: "#39A0D6" },
  "Pet": { bg: "#F3F0E4", fg: "#8A6D1F", dot: "#C6A23A" },
  "Beleza": { bg: "#FCEBF3", fg: "#A32B6C", dot: "#DE619F" },
  "Lavanderia": { bg: "#EAF7F7", fg: "#0E7A7A", dot: "#2CA9A9" },
  "Mercado": { bg: "#F1F7E9", fg: "#4C7A1B", dot: "#7FAE3A" },
  "Casa": { bg: "#F5F1EA", fg: "#7A6448", dot: "#B69A6E" },
  "Educação/Cultura": { bg: "#EEF1FB", fg: "#38489E", dot: "#6577D6" },
  "Assinaturas": { bg: "#EFF6FB", fg: "#1B7B93", dot: "#3FB0CC" },
  "Pix / Transferência": { bg: "#F0F0F0", fg: "#555555", dot: "#8C8C8C" },
  "Doações": { bg: "#FBF3E4", fg: "#8A5A1F", dot: "#C68A3A" },
  "Pagamento da Fatura": { bg: "#E7F0EA", fg: "#2C6E49", dot: "#4E9A6E" },
  "Outros": { bg: "#F2F0EC", fg: "#6B6558", dot: "#A39B8A" },
};

export const CATEGORY_ORDER = Object.keys(CATEGORY_STYLE);

const RULES = [
  [/uber|99app|99pop|taxi/i, "Transporte"],
  [/cascol|posto |combustive|abastece|ipiranga|shell|ecovias|sem parar|pedagio/i, "Transporte"],
  [/gol linhas|latam air|azul linhas|quality\*|quality hotel|hotel|pousada|booking|airbnb/i, "Viagem"],
  [/rapilave|lavefacil|lavanderia/i, "Lavanderia"],
  [/farmacia|drogasil|drogaria|granado|rd saude|pague menos|panvel/i, "Saúde"],
  [/me\.linda|cosmetico|perfum|salao|barbearia|manicure/i, "Beleza"],
  [/planet|clarisol|youcom|renner|shein|calcado|couro|confeccoes| c\&a|riachuelo|zara|daiso|filhas d areia|vestuario/i, "Vestuário/Compras"],
  [/supermercado|atacadao|carrefour|extra |assai|pao de acucar/i, "Mercado"],
  [/cobasi|petz|pet /i, "Pet"],
  [/netflix|spotify|amazon prime|disney|hbo|youtube premium|icloud|google one|assinatura/i, "Assinaturas"],
  [/energisa|light |cemig|sabesp|copasa|enel|vivo |claro |tim |oi telecom|condominio|aluguel|imobiliaria/i, "Casa"],
  [/restaurante|lanchonete|bistro|pizzaria|padaria|paes e convenie|churrascaria|bar |cafe |sorveteria|acai|hamburgueria|ifd\*|ifood|rappi/i, "Alimentação/Lazer"],
  [/pix (no crédito|recebido) -/i, "Pix / Transferência"],
  [/pagamento recebido/i, "Pagamento da Fatura"],
  [/paroquia|igreja|doacao|instituto |ong /i, "Doações"],
  [/livraria|editora|curso |udemy|escola |faculdade|universidade/i, "Educação/Cultura"],
  [/amazonmktplc|mercado livre|magazineluiza|shopee|aliexpress/i, "Compras Online"],
];

export function autoCategory(title, overrides = {}) {
  const norm = normalizeTitle(title);
  if (overrides[norm]) return overrides[norm];
  for (const [pattern, category] of RULES) {
    if (pattern.test(title)) return category;
  }
  return "Outros";
}

// Normaliza o título de um estabelecimento para servir de chave de aprendizado
// (remove número de parcela, acentuação de caixa, espaços extras).
export function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/-\s*parcela\s*\d+\/\d+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
