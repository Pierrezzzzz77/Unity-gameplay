//! Simulação da fila e da montagem.
//!
//! O estado de uma build é calculado a partir do tempo decorrido desde o
//! envio, então não há threads nem timers: o frontend consulta
//! `build_status` periodicamente e recebe a situação atual.
//!
//! Para ligar numa API/broker real, troque a implementação deste módulo
//! mantendo o formato de `BuildStatus`.

use std::collections::HashMap;
use std::time::{Duration, Instant};

use serde::Serialize;

use crate::catalog::Category;

/// Tempo que cada build à frente leva para sair da fila.
pub const SLOT: Duration = Duration::from_secs(6);
/// Duração de cada etapa da montagem.
pub const STAGE: Duration = Duration::from_secs(5);
/// Etapas: processador, memória, placa de vídeo, finalização.
pub const STAGE_COUNT: u32 = 4;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Phase {
    Queued,
    Assembling,
    Done,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SelectedPart {
    pub category: String,
    pub label: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BuildStatus {
    pub id: u32,
    pub number: u32,
    pub phase: Phase,
    /// Quantas builds ainda estão à frente (0 = é a sua vez)
    pub queue_position: u32,
    pub queue_total: u32,
    /// Segundos até começar a montagem (fila) ou até terminar (montagem)
    pub eta_seconds: u32,
    /// 0–100
    pub progress: f64,
    /// Etapa atual da montagem (0..STAGE_COUNT)
    pub stage_index: u32,
    pub parts: Vec<SelectedPart>,
}

struct Build {
    number: u32,
    parts: Vec<SelectedPart>,
    submitted_at: Instant,
    ahead: u32,
    behind: u32,
}

impl Build {
    fn status_at(&self, id: u32, elapsed: Duration) -> BuildStatus {
        let wait = SLOT * self.ahead;
        let assembly = STAGE * STAGE_COUNT;

        let mut status = BuildStatus {
            id,
            number: self.number,
            phase: Phase::Queued,
            queue_position: 0,
            queue_total: 1 + self.behind,
            eta_seconds: 0,
            progress: 0.0,
            stage_index: 0,
            parts: self.parts.clone(),
        };

        if elapsed < wait {
            let served = (elapsed.as_millis() / SLOT.as_millis()) as u32;
            status.queue_position = self.ahead - served;
            status.queue_total += status.queue_position;
            status.eta_seconds = ceil_secs(wait - elapsed);
            return status;
        }

        let t = elapsed - wait;
        if t < assembly {
            status.phase = Phase::Assembling;
            status.stage_index = (t.as_millis() / STAGE.as_millis()) as u32;
            status.progress = t.as_secs_f64() / assembly.as_secs_f64() * 100.0;
            status.eta_seconds = ceil_secs(assembly - t);
        } else {
            status.phase = Phase::Done;
            status.stage_index = STAGE_COUNT;
            status.progress = 100.0;
        }
        status
    }
}

fn ceil_secs(d: Duration) -> u32 {
    d.as_millis().div_ceil(1000) as u32
}

pub struct Simulator {
    catalog: Vec<Category>,
    next_id: u32,
    builds: HashMap<u32, Build>,
}

impl Simulator {
    pub fn new(catalog: Vec<Category>) -> Self {
        Self { catalog, next_id: 1, builds: HashMap::new() }
    }

    pub fn catalog(&self) -> &[Category] {
        &self.catalog
    }

    /// Valida a seleção (uma opção existente por categoria) e coloca a
    /// build na fila.
    pub fn submit(&mut self, selection: &HashMap<String, String>) -> Result<BuildStatus, String> {
        let parts = self
            .catalog
            .iter()
            .map(|cat| {
                let chosen = selection
                    .get(&cat.id)
                    .ok_or_else(|| format!("Escolha um item em \"{}\".", cat.title))?;
                let option = cat
                    .options
                    .iter()
                    .find(|o| &o.id == chosen)
                    .ok_or_else(|| format!("Peça inválida em \"{}\".", cat.title))?;
                Ok(SelectedPart { category: cat.id.clone(), label: option.label.clone() })
            })
            .collect::<Result<Vec<_>, String>>()?;

        let id = self.next_id;
        self.next_id += 1;
        let build = Build {
            number: id,
            parts,
            submitted_at: Instant::now(),
            // Valores de demonstração: 2–4 builds à frente, 5–11 atrás.
            ahead: 2 + id % 3,
            behind: 5 + id % 7,
        };
        let status = build.status_at(id, Duration::ZERO);
        self.builds.insert(id, build);
        Ok(status)
    }

    pub fn status(&self, id: u32) -> Result<BuildStatus, String> {
        let build = self.builds.get(&id).ok_or("Build não encontrada.")?;
        Ok(build.status_at(id, build.submitted_at.elapsed()))
    }

    pub fn cancel(&mut self, id: u32) {
        self.builds.remove(&id);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::catalog;

    fn full_selection() -> HashMap<String, String> {
        catalog::load()
            .into_iter()
            .map(|c| (c.id, c.options[0].id.clone()))
            .collect()
    }

    #[test]
    fn submit_rejects_missing_or_unknown_parts() {
        let mut sim = Simulator::new(catalog::load());
        let mut sel = full_selection();
        sel.remove("gpu");
        assert!(sim.submit(&sel).is_err());
        sel.insert("gpu".into(), "gtx-9999".into());
        assert!(sim.submit(&sel).is_err());
    }

    #[test]
    fn submit_returns_queued_status_with_labels() {
        let mut sim = Simulator::new(catalog::load());
        let status = sim.submit(&full_selection()).unwrap();
        assert_eq!(status.phase, Phase::Queued);
        assert_eq!(status.number, 1);
        assert_eq!(status.parts.len(), 4);
        assert_eq!(status.parts[0].label, "Ryzen 5 5600");
        assert!(status.queue_position >= 2);
        assert_eq!(status.eta_seconds, SLOT.as_secs() as u32 * status.queue_position);
    }

    #[test]
    fn status_moves_through_queue_assembly_and_done() {
        let build = Build { number: 7, parts: vec![], submitted_at: Instant::now(), ahead: 2, behind: 5 };

        let s = build.status_at(7, SLOT + Duration::from_millis(1));
        assert_eq!((s.phase, s.queue_position, s.queue_total), (Phase::Queued, 1, 7));

        let s = build.status_at(7, SLOT * 2 + STAGE * 2);
        assert_eq!((s.phase, s.stage_index), (Phase::Assembling, 2));
        assert!((s.progress - 50.0).abs() < 1e-9);

        let s = build.status_at(7, SLOT * 2 + STAGE * STAGE_COUNT);
        assert_eq!((s.phase, s.progress, s.eta_seconds), (Phase::Done, 100.0, 0));
    }
}
