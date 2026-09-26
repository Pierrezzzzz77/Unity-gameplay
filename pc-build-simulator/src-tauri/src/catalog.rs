//! Catálogo de peças. Os dados vêm de `catalog.json` (raiz do projeto),
//! o mesmo arquivo que o frontend usa no modo navegador.

use serde::{Deserialize, Serialize};

const CATALOG_JSON: &str = include_str!("../../catalog.json");

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PartOption {
    pub id: String,
    /// Rótulo curto (selo do card e resumo da build)
    pub label: String,
    /// Nome completo exibido na opção
    pub name: String,
    /// Linha de especificações
    pub meta: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Category {
    pub id: String,
    pub title: String,
    pub hint: String,
    pub summary_label: String,
    pub options: Vec<PartOption>,
}

pub fn load() -> Vec<Category> {
    serde_json::from_str(CATALOG_JSON).expect("catalog.json inválido")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn catalog_parses_with_four_categories() {
        let catalog = load();
        let ids: Vec<_> = catalog.iter().map(|c| c.id.as_str()).collect();
        assert_eq!(ids, ["cpu", "gpu", "ram", "ssd"]);
        assert!(catalog.iter().all(|c| !c.options.is_empty()));
    }
}
